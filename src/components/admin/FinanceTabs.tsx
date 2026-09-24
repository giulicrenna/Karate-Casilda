'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/admin/pagos/gastos', label: 'Gastos' },
  { href: '/admin/pagos/ingresos', label: 'Ingresos' },
  { href: '/admin/pagos/reportes', label: 'Reportes' },
];

export default function FinanceTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 border-b border-ink-900 mb-6" aria-label="Finanzas">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname?.startsWith(t.href + '/');
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'rounded-t-sm px-4 py-2 text-xs uppercase tracking-wider transition-colors',
              active
                ? 'border-b-2 border-shiroi-500 text-shiroi-300'
                : 'text-ink-400 hover:text-ink-100',
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
