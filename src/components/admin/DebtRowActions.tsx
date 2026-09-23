'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Ban, CheckCircle2 } from 'lucide-react';
import DebtAdjustmentForm from './DebtAdjustmentForm';
import ManualPaymentForm from './ManualPaymentForm';

interface Props {
  debt: {
    id: string;
    status: string;
    studentName: string;
    manualAdjustment: number;
    manualNote: string | null;
    totalAmount: number;
    paidAmount: number;
    balance: number;
  };
}

export default function DebtRowActions({ debt }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const cancel = async () => {
    if (!confirm('¿Cancelar esta deuda? Esta acción no se puede deshacer.')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/pagos/debts/${debt.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error' }));
        alert(data.error || 'No se pudo cancelar la deuda.');
        return;
      }
      router.refresh();
    } finally {
      setCancelling(false);
    }
  };

  const remaining = Math.max(0, debt.totalAmount - debt.paidAmount);

  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-shiroi-400"
          aria-label={expanded ? 'Cerrar' : 'Expandir'}
          title={expanded ? 'Cerrar' : 'Ajustar / registrar pago'}
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {debt.status !== 'cancelled' && debt.status !== 'paid' && (
          <button
            type="button"
            onClick={cancel}
            disabled={cancelling}
            className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-shiroi-950 hover:text-shiroi-400 disabled:opacity-50"
            aria-label="Cancelar deuda"
            title="Cancelar deuda"
          >
            <Ban className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-2 space-y-3">
          {debt.status !== 'cancelled' && debt.status !== 'paid' && remaining > 0 && (
            <ManualPaymentForm
              debtId={debt.id}
              remainingAmount={remaining}
              studentName={debt.studentName}
            />
          )}
          {debt.status !== 'cancelled' && (
            <DebtAdjustmentForm
              debtId={debt.id}
              initialAdjustment={debt.manualAdjustment}
              initialNote={debt.manualNote}
              onSaved={() => router.refresh()}
            />
          )}
          {debt.status === 'paid' && (
            <p className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Deuda totalmente cobrada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}