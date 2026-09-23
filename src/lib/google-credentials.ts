import 'server-only';
import { prisma } from '@/lib/db';
import { decryptSecret } from '@/lib/secrets';

export const GOOGLE_DRIVE_KEY = 'google_drive_sa';

export interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

export async function getServiceAccountCredentials(): Promise<ServiceAccountCredentials | null> {
  const row = await prisma.integrationConfig.findUnique({ where: { key: GOOGLE_DRIVE_KEY } });
  if (!row) return null;
  try {
    return JSON.parse(decryptSecret(row.encrypted, GOOGLE_DRIVE_KEY));
  } catch {
    return null;
  }
}

export function isServiceAccountJson(value: unknown): value is ServiceAccountCredentials {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    v.type === 'service_account' &&
    typeof v.project_id === 'string' &&
    typeof v.private_key === 'string' &&
    typeof v.client_email === 'string'
  );
}
