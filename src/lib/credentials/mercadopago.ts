// Patrón como `google-credentials.ts` — credenciales cifradas en `IntegrationConfig`.

import 'server-only';
import { prisma } from '@/lib/db';
import { encryptSecret, decryptSecret } from '@/lib/secrets';

export const MERCADOPAGO_KEY = 'mercadopago';

export interface MercadoPagoCredentials {
  accessToken: string;
  publicKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
}

export async function getMercadoPagoCredentials(): Promise<MercadoPagoCredentials | null> {
  const row = await prisma.integrationConfig.findUnique({ where: { key: MERCADOPAGO_KEY } });
  if (!row) return null;
  try {
    return JSON.parse(decryptSecret(row.encrypted, MERCADOPAGO_KEY));
  } catch {
    return null;
  }
}

export async function saveMercadoPagoCredentials(creds: MercadoPagoCredentials): Promise<void> {
  const encrypted = encryptSecret(JSON.stringify(creds), MERCADOPAGO_KEY);
  await prisma.integrationConfig.upsert({
    where: { key: MERCADOPAGO_KEY },
    create: { key: MERCADOPAGO_KEY, encrypted },
    update: { encrypted },
  });
}

export function isMercadoPagoCredentials(v: unknown): v is MercadoPagoCredentials {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.accessToken === 'string' &&
    typeof o.publicKey === 'string' &&
    typeof o.webhookSecret === 'string' &&
    (o.environment === 'sandbox' || o.environment === 'production')
  );
}

export function getMercadoPagoBaseUrl(environment: 'sandbox' | 'production'): string {
  // MP usa la misma base para sandbox/prod (la diferencia es init_point + token).
  void environment;
  return 'https://api.mercadopago.com';
}

export function getInitPointUrl(
  environment: 'sandbox' | 'production',
  preferenceId: string,
): string {
  return environment === 'production'
    ? `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`
    : `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
}
