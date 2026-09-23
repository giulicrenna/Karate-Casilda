'use client';

import { useMemo, useState } from 'react';
import { formatARS } from '@/lib/money';
import { formatDate } from '@/lib/utils';

interface ExpenseRow {
  id: string;
  category: string;
  description: string;
  amount: number;
  occurredAt: string;
  vendor: string | null;
  notes: string | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  alquiler: 'Alquiler',
  sueldos: 'Sueldos',
  servicios: 'Servicios',
  insumos: 'Insumos',
  mantenimiento: 'Mantenimiento',
  impuestos: 'Impuestos',
  otro: 'Otro',
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABEL).map((v) => ({
  value: v,
  label: CATEGORY_LABEL[v],
}));

export default function ExpenseTable({
  expenses,
  actions,
}: {
  expenses: ExpenseRow[];
  actions?: (id: string, description: string) => React.ReactNode;
}) {
  const [category, setCategory] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (category && e.category !== category) return false;
      const d = new Date(e.occurredAt);
      if (from && d < new Date(from)) return false;
      if (to && d > new Date(to + 'T23:59:59')) return false;
      return true;
    });
  }, [expenses, category, from, to]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Categoría
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todas</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          />
        </div>
        <div className="flex items-end">
          <div className="rounded-sm border border-ink-800 bg-ink-900 px-3 py-1.5 text-xs w-full">
            <div className="text-[10px] uppercase tracking-wider text-ink-500">Total</div>
            <div className="font-display text-lg text-ink-100">{formatARS(total)}</div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">No hay gastos registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">Categoría</th>
                <th className="px-3 py-3">Descripción</th>
                <th className="hidden md:table-cell px-3 py-3">Proveedor</th>
                <th className="px-3 py-3 text-right">Monto</th>
                {actions && <th className="px-3 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-ink-900/30">
                  <td className="px-3 py-3 text-xs text-ink-300">
                    {formatDate(new Date(e.occurredAt))}
                  </td>
                  <td className="px-3 py-3 text-ink-200">
                    {CATEGORY_LABEL[e.category] ?? e.category}
                  </td>
                  <td className="px-3 py-3 text-ink-100">
                    {e.description}
                    {e.notes && (
                      <div className="mt-0.5 text-[10px] italic text-ink-500">{e.notes}</div>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-3 py-3 text-ink-400">
                    {e.vendor ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-ink-100">
                    {formatARS(e.amount)}
                  </td>
                  {actions && (
                    <td className="px-3 py-3 text-right">{actions(e.id, e.description)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}