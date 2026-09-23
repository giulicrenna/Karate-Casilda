import 'server-only';
import { NextRequest } from 'next/server';

/**
 * Valida el header `Authorization: Bearer ${CRON_SECRET}` o `x-cron-secret: ${CRON_SECRET}`.
 * Vercel Cron Jobs envía automáticamente `Authorization: Bearer ${CRON_SECRET}` en producción.
 */
export function verifyCronSecret(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const authHeader = req.headers.get('authorization');
  if (authHeader === `Bearer ${expected}`) return true;

  const customHeader = req.headers.get('x-cron-secret');
  if (customHeader === expected) return true;

  return false;
}

export function cronUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'No autorizado' }),
    { status: 401, headers: { 'content-type': 'application/json' } },
  );
}