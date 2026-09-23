// Sistema de autenticación para alumnos.
// Usa cookies HTTP-only firmadas con HMAC-SHA256 (mismo esquema que auth.ts).
// Diseñado para ser seguro y compatible con Vercel (sin estado en memoria).

import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const COOKIE_NAME = process.env.STUDENT_COOKIE_NAME || 'karate_student_session';
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

export interface StudentSessionPayload {
  studentId: string;
  email: string;
  mustChangePwd: boolean;
  expiresAt: number;
}

export async function createStudentSession(payload: Omit<StudentSessionPayload, 'expiresAt'>) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const token = encode({ ...payload, expiresAt });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // permite retorno desde Mercado Pago
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getStudentSession(): Promise<StudentSessionPayload | null> {
  const c = cookies().get(COOKIE_NAME);
  if (!c) return null;
  const data = decode(c.value);
  if (!data || typeof data !== 'object') return null;
  if (typeof data.expiresAt !== 'number' || data.expiresAt < Date.now()) {
    cookies().delete(COOKIE_NAME);
    return null;
  }
  if (
    typeof data.studentId !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.mustChangePwd !== 'boolean'
  ) {
    return null;
  }
  return data as unknown as StudentSessionPayload;
}

export async function destroyStudentSession() {
  cookies().delete(COOKIE_NAME);
}

/** Hashea un token de recuperación de contraseña (SHA-256). */
export function hashPasswordResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Genera un token seguro aleatorio (base64url). */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}