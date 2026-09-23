// Credenciales cifradas del servicio de email — Resend (default) o SMTP (fallback).
// Patrón como `google-credentials.ts`.

import 'server-only';
import { prisma } from '@/lib/db';
import { encryptSecret, decryptSecret } from '@/lib/secrets';

export const EMAIL_KEY = 'email';

export type EmailProvider = 'resend' | 'smtp';

export interface EmailCredentials {
  provider: EmailProvider;
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromAddress: string; // ej: "no-reply@karatecasilda.local"
  fromName?: string;
}

export async function getEmailCredentials(): Promise<EmailCredentials | null> {
  const row = await prisma.integrationConfig.findUnique({ where: { key: EMAIL_KEY } });
  if (!row) return null;
  try {
    return JSON.parse(decryptSecret(row.encrypted, EMAIL_KEY));
  } catch {
    return null;
  }
}

export async function saveEmailCredentials(creds: EmailCredentials): Promise<void> {
  const encrypted = encryptSecret(JSON.stringify(creds), EMAIL_KEY);
  await prisma.integrationConfig.upsert({
    where: { key: EMAIL_KEY },
    create: { key: EMAIL_KEY, encrypted },
    update: { encrypted },
  });
}

export function isEmailCredentials(v: unknown): v is EmailCredentials {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (typeof o.fromAddress !== 'string' || o.fromAddress.length === 0) return false;
  if (o.provider !== 'resend' && o.provider !== 'smtp') return false;
  if (o.provider === 'resend' && typeof o.resendApiKey !== 'string') return false;
  return true;
}
