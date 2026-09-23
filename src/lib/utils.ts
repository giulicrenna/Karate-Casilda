import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convierte un título en slug URL-safe */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

/** Formatea una fecha para mostrar en español */
export function formatDate(date: Date | string, options?: { withTime?: boolean; locale?: string }): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = options?.locale ?? 'es-AR';
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  if (options?.withTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
  }
  return new Intl.DateTimeFormat(locale, dateOptions).format(d);
}

/** Formatea un tamaño de archivo en bytes */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Trunca un texto a una longitud máxima con elipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

/** Normaliza un handle de Instagram a su URL completa. Acepta @usuario, usuario, o URL completa. */
export function instagramUrl(value: string): string {
  const handle = value
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/\/$/, '');
  if (!handle) return '';
  return `https://instagram.com/${handle}`;
}

/** Lee el contenido institucional desde la DB con valor por defecto */
export async function getContent(key: string, defaultValue = ''): Promise<string> {
  const { prisma } = await import('./db');
  const row = await prisma.siteContent.findUnique({ where: { key } });
  return row?.value ?? defaultValue;
}

/** Lee múltiples contenidos institucionales en una sola query */
export async function getManyContent(keys: string[]): Promise<Record<string, string>> {
  const { prisma } = await import('./db');
  const rows = await prisma.siteContent.findMany({
    where: { key: { in: keys } },
  });
  const map: Record<string, string> = {};
  for (const k of keys) map[k] = '';
  for (const row of rows) map[row.key] = row.value;
  return map;
}
