'use client';

import { useMemo, useState } from 'react';
import { formatARS } from '@/lib/money';
import { formatPeriod } from '@/lib/schedule';
import { formatDate } from '@/lib/utils';
import DebtRowActions from './DebtRowActions';
import type { DebtStatus } from '@/types';

interface DebtRow {
  id: string;
  studentId: string;
  studentName: string;
  periodYear: number;
  periodMonth: number;
  baseAmount: number;
  surchargeAmount: number;
  manualAdjustment: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: DebtStatus;
  manualNote: string | null;
}

interface Props {
  debts: DebtRow[];
}

const STATUS_LABEL: Record<DebtStatus, string> = {
  pending: 'Pendiente',
  partial: 'Parcial',
  paid: 'Pagada',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
};

function statusBadgeClasses(status: DebtStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-emerald-900/30 text-emerald-300';
    case 'partial':
      return 'bg-amber-900/30 text-amber-300';
    case 'overdue':
      return 'bg-shiroi-900/40 text-shiroi-300';
    case 'cancelled':
      return 'bg-ink-800 text-ink-500 line-through';
    case 'pending':
    default:
      return 'bg-ink-800 text-ink-300';
  }
}

export default function DebtTable({ debts }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [studentQ, setStudentQ] = useState<string>('');

  const years = useMemo(() => {
    const set = new Set<number>();
    debts.forEach((d) => set.add(d.periodYear));
    set.add(currentYear);
    return Array.from(set).sort((a, b) => b - a);
  }, [debts, currentYear]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: formatPeriod(0, i + 1).replace(/^\d+\s/, ''),
      })),
    [],
  );

  const filtered = useMemo(() => {
    return debts.filter((d) => {
      if (year && String(d.periodYear) !== year) return false;
      if (month && String(d.periodMonth) !== month) return false;
      if (statusFilter && d.status !== statusFilter) return false;
      if (studentQ && !d.studentName.toLowerCase().includes(studentQ.toLowerCase()))
        return false;
      return true;
    });
  }, [debts, year, month, statusFilter, studentQ]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Año
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Mes
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todos</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Estado
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="partial">Parcial</option>
            <option value="paid">Pagada</option>
            <option value="overdue">Vencida</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Alumno
          </label>
          <input
            value={studentQ}
            onChange={(e) => setStudentQ(e.target.value)}
            placeholder="Buscar…"
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">
            {debts.length === 0
              ? 'No hay deudas registradas. Generá las del mes para empezar.'
              : 'No hay deudas que coincidan con los filtros.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-3 py-3">Alumno</th>
                <th className="px-3 py-3">Período</th>
                <th className="hidden md:table-cell px-3 py-3 text-right">Base</th>
                <th className="hidden md:table-cell px-3 py-3 text-right">Recargo</th>
                <th className="px-3 py-3 text-right">Total</th>
                <th className="hidden sm:table-cell px-3 py-3 text-right">Pagado</th>
                <th className="px-3 py-3 text-right">Saldo</th>
                <th className="hidden lg:table-cell px-3 py-3">Vencimiento</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-ink-900/30 align-top">
                  <td className="px-3 py-3 text-ink-100">
                    <div className="font-display">{d.studentName}</div>
                    {d.manualNote && (
                      <div className="mt-1 text-[10px] italic text-ink-500">
                        “{d.manualNote}”
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-ink-300">
                    {formatPeriod(d.periodYear, d.periodMonth)}
                  </td>
                  <td className="hidden md:table-cell px-3 py-3 text-right text-ink-300">
                    {formatARS(d.baseAmount)}
                  </td>
                  <td className="hidden md:table-cell px-3 py-3 text-right text-ink-400">
                    {d.surchargeAmount > 0 ? formatARS(d.surchargeAmount) : '—'}
                  </td>
                  <td className="px-3 py-3 text-right text-ink-100 font-medium">
                    {formatARS(d.totalAmount)}
                  </td>
                  <td className="hidden sm:table-cell px-3 py-3 text-right text-ink-300">
                    {formatARS(d.paidAmount)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={
                        d.balance > 0
                          ? 'text-shiroi-400 font-medium'
                          : 'text-emerald-400'
                      }
                    >
                      {formatARS(d.balance)}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-3 py-3 text-xs text-ink-400">
                    {formatDate(new Date(d.dueDate))}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
                        statusBadgeClasses(d.status)
                      }
                    >
                      {STATUS_LABEL[d.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <DebtRowActions
                      debt={{
                        id: d.id,
                        status: d.status,
                        studentName: d.studentName,
                        manualAdjustment: d.manualAdjustment,
                        manualNote: d.manualNote,
                        totalAmount: d.totalAmount,
                        paidAmount: d.paidAmount,
                        balance: d.balance,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}