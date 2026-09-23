// Helpers para formateo y parseo de montos en pesos argentinos (es-AR).

/** Formatea un número como moneda ARS (es-AR): "$1.234,56". */
export function formatARS(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '$0,00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Parsea un string con formato es-AR/EN a número. Acepta separadores `.`/` ` y coma como decimal. */
export function parseDecimal(s: string | number | null | undefined): number {
  if (s == null) return 0;
  if (typeof s === 'number') return Number.isFinite(s) ? s : 0;
  const cleaned = String(s).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : 0;
}