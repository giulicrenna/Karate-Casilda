// Credenciales cifradas de WaSender API — patrón `google-credentials.ts`.

import 'server-only';
import { prisma } from '@/lib/db';
import { encryptSecret, decryptSecret } from '@/lib/secrets';

export const WASENDER_KEY = 'wasender';

export interface WaSenderCredentials {
  apiKey: string;
  baseUrl?: string; // opcional, default https://www.wasenderapi.com
  phoneNumber?: string; // opcional, solo informativo (E.164 del número remitente)
}

export async function getWaSenderCredentials(): Promise<WaSenderCredentials | null> {
  const row = await prisma.integrationConfig.findUnique({ where: { key: WASENDER_KEY } });
  if (!row) return null;
  try {
    return JSON.parse(decryptSecret(row.encrypted, WASENDER_KEY));
  } catch {
    return null;
  }
}

export async function saveWaSenderCredentials(creds: WaSenderCredentials): Promise<void> {
  const encrypted = encryptSecret(JSON.stringify(creds), WASENDER_KEY);
  await prisma.integrationConfig.upsert({
    where: { key: WASENDER_KEY },
    create: { key: WASENDER_KEY, encrypted },
    update: { encrypted },
  });
}

export function isWaSenderCredentials(v: unknown): v is WaSenderCredentials {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.apiKey === 'string' && o.apiKey.length > 0;
}
