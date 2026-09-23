// Helper: devuelve la URL pública del sitio (sin trailing slash).
// Orden de prioridad:
//   1. NEXT_PUBLIC_SITE_URL (manual)
//   2. VERCEL_URL (auto en Vercel — agregamos protocolo https)
//   3. http://localhost:3000 (dev)

export function getSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  const base = fromEnv || 'http://localhost:3000';
  return base.replace(/\/+$/, '');
}
