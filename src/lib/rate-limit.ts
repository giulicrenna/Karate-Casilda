// Rate limit naive en memoria compartido entre admin y student login.
// Aceptable para Vercel single-instance; upgrade ideal: Upstash.

interface RateLimitEntry {
  count: number;
  firstAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimitOptions {
  max?: number;
  windowMs?: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const max = options.max ?? 5;
  const windowMs = options.windowMs ?? 15 * 60 * 1000;
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.firstAt > windowMs) {
    buckets.set(key, { count: 1, firstAt: now });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.firstAt + windowMs };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: max - entry.count,
    resetAt: entry.firstAt + windowMs,
  };
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') || 'unknown';
}