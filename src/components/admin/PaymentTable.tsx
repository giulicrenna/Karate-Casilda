'use client';

import { useMemo, useState } from 'react';
import { formatARS } from '@/lib/money';
import { formatDate } from '@/lib/utils';
import PaymentRowActions from './PaymentRowActions';

interface PaymentRow {
  id: string;
  studentName: string;
  debtId: string | null;
  debtPeriod: string | null;
  amount: number;
  currency: string;
  method: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface Props {
  payments: PaymentRow[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  refunded: 'Reembolsado',
  cancelled: 'Anulado',
};
const METHOD_LABEL: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  manual: 'Manual',
  cash: 'Efectivo',
  transfer: 'Transferencia',
};

function statusClasses(s: string): string {
  switch (s) {
    case 'approved':
      return 'bg-emerald-900/30 text-emerald-300';
    case 'pending':
      return 'bg-ink-800 text-ink-300';
    case 'rejected':
      return 'bg-shiroi-900/40 text-shiroi-300';
    case 'refunded':
      return 'bg-amber-900/30 text-amber-300';
    case 'cancelled':
      return 'bg-ink-800 text-ink-500 line-through';
    default:
      return 'bg-ink-800 text-ink-300';
  }
}

export default function PaymentTable({ payments }: Props) {
  const [method, setMethod] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (method && p.method !== method) return false;
      if (status && p.status !== status) return false;
      return true;
    });
  }, [payments, method, status]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Método
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todos</option>
            <option value="mercadopago">Mercado Pago</option>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
            <option value="refunded">Reembolsado</option>
            <option value="cancelled">Anulado</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">No hay pagos registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-3 py-3">Alumno</th>
                <th className="px-3 py-3">Período</th>
                <th className="px-3 py-3 text-right">Monto</th>
                <th className="hidden md:table-cell px-3 py-3">Método</th>
                <th className="hidden sm:table-cell px-3 py-3">Fecha</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-ink-900/30">
                  <td className="px-3 py-3 text-ink-100">{p.studentName}</td>
                  <td className="px-3 py-3 text-ink-300">
                    {p.debtPeriod ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-right text-ink-100 font-medium">
                    {formatARS(p.amount)}
                  </td>
                  <td className="hidden md:table-cell px-3 py-3 text-ink-300">
                    {METHOD_LABEL[p.method]}
                  </td>
                  <td className="hidden sm:table-cell px-3 py-3 text-xs text-ink-400">
                    {p.paidAt ? formatDate(new Date(p.paidAt)) : formatDate(new Date(p.createdAt))}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
                        statusClasses(p.status)
                      }
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <PaymentRowActions paymentId={p.id} status={p.status} />
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