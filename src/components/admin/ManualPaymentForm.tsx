'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

interface Props {
  debtId: string;
  remainingAmount: number;
  studentName?: string;
}

export default function ManualPaymentForm({
  debtId,
  remainingAmount,
  studentName,
}: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(Math.round(remainingAmount * 100) / 100);
  const [method, setMethod] = useState<'cash' | 'transfer' | 'manual'>('cash');
  const [paidAt, setPaidAt] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/pagos/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debtId,
          amount,
          method,
          paidAt: new Date(paidAt).toISOString(),
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error desconocido' }));
        setError(data.error || 'No se pudo registrar el pago.');
        return;
      }
      router.refresh();
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-md border border-ink-800 bg-ink-950 p-4"
    >
      {studentName && (
        <p className="text-xs text-ink-400">
          Registrando pago para <span className="text-ink-200">{studentName}</span> — saldo pendiente:{' '}
          <span className="text-shiroi-300">
            ${remainingAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1">
            Monto (ARS)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="10000000"
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-shiroi-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1">
            Método
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as 'cash' | 'transfer' | 'manual')}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-shiroi-700 focus:outline-none"
          >
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-shiroi-700 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1">
          Notas
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-sm border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-shiroi-700 focus:outline-none"
          placeholder="Opcional"
          maxLength={500}
        />
      </div>
      {error && <p className="text-xs text-shiroi-400">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary text-xs">
          <Save className="h-4 w-4" />
          {saving ? 'Registrando…' : 'Registrar pago'}
        </button>
      </div>
    </form>
  );
}