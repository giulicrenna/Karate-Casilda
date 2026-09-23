// Helpers de fechas y períodos para el sistema de cuotas.

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** Retorna el año/mes del mes anterior (1..12). */
export function previousMonth(ref: Date = new Date()): { year: number; month: number } {
  const d = new Date(ref.getTime());
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** Retorna el año/mes del mes siguiente. */
export function nextMonth(ref: Date = new Date()): { year: number; month: number } {
  const d = new Date(ref.getTime());
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** Nombre del mes en español (1 = Enero). */
export function monthName(month: number): string {
  if (month < 1 || month > 12) return '';
  return MONTH_NAMES[month - 1];
}

/** true si dueDate < today (compara solo el día, ignora hora). */
export function isPastDue(dueDate: Date, today: Date = new Date()): boolean {
  const d = new Date(dueDate.getTime());
  d.setHours(0, 0, 0, 0);
  const t = new Date(today.getTime());
  t.setHours(0, 0, 0, 0);
  return d.getTime() < t.getTime();
}

/** "Marzo 2026" en español. */
export function formatPeriod(year: number, month: number): string {
  return `${monthName(month)} ${year}`;
}

/** Día del mes (1..31) de una fecha. */
export function dayOfMonth(d: Date): number {
  return d.getDate();
}