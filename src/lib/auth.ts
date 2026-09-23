// Sistema de autenticación simple para el panel admin.
// Usa cookies HTTP-only firmadas con HMAC-SHA256 y bcrypt para hashes.
// Diseñado para ser seguro y compatible con Vercel (sin estado en memoria).

import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit';

export { checkRateLimit, clearRateLimit, getClientIp } from '@/lib/rate-limit';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'karate_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getSecret(): string {
  const secret = process.env.SESSION_PASSWORD;
  if (!secret || secret.length < 32 || secret.includes('REEMPLAZAR')) {
    throw new Error(
      'SESSION_PASSWORD debe estar definida en .env.local con un valor de al menos 32 caracteres.'
    );
  }
  return secret;
}

function sign(data: string): string {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

function encode(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json).toString('base64url');
  return `${body}.${sign(body)}`;
}

function decode(token: string): Record<string, unknown> | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  if (sign(body) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

export interface AdminSessionPayload {
  userId: string;
  email: string;
  role: string;
  expiresAt: number;
}

export async function createAdminSession(payload: Omit<AdminSessionPayload, 'expiresAt'>) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const token = encode({ ...payload, expiresAt });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const c = cookies().get(COOKIE_NAME);
  if (!c) return null;
  const data = decode(c.value);
  if (!data || typeof data !== 'object') return null;
  if (typeof data.expiresAt !== 'number' || data.expiresAt < Date.now()) {
    cookies().delete(COOKIE_NAME);
    return null;
  }
  if (
    typeof data.userId !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.role !== 'string'
  ) {
    return null;
  }
  return data as unknown as AdminSessionPayload;
}

export async function destroyAdminSession() {
  cookies().delete(COOKIE_NAME);
}

/** Rate-limit para intentos de login admin (5/15min por IP). Wrapper del módulo compartido. */
export function checkLoginRateLimit(
  ip: string,
  max = 5,
  windowMs = 15 * 60 * 1000,
): boolean {
  return checkRateLimit(`admin:${ip}`, { max, windowMs }).allowed;
}

export function clearLoginRateLimit(ip: string) {
  clearRateLimit(`admin:${ip}`);
}
