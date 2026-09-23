'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

interface Props {
  debtId: string;
  initialAdjustment: number;
  initialNote: string | null;
  onSaved?: () => void;
}

export default function DebtAdjustmentForm({
  debtId,
  initialAdjustment,
  initialNote,
  onSaved,
}: Props) {
  const [adjustment, setAdjustment] = useState<number>(initialAdjustment);
  const [note, setNote] = useState<string>(initialNote ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/pagos/debts/${debtId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualAdjustment: adjustment,
          manualNote: note.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error desconocido' }));
        setError(data.error || 'No se pudo guardar el ajuste.');
        return;
      }
      setOk(true);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-ink-800 bg-ink-950 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1">
            Ajuste manual (ARS)
          </label>
          <input
            type="number"
            step="0.01"
            value={adjustment}
            onChange={(e) => setAdjustment(Number(e.target.value))}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-shiroi-700 focus:outline-none"
            placeholder="0"
          />
          <p className="mt-1 text-[11px] text-ink-500">
            Negativo descuenta, positivo suma al total.
          </p>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1">
            Nota
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-shiroi-700 focus:outline-none"
            placeholder="Motivo del ajuste"
            maxLength={500}
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-shiroi-400">{error}</p>
      )}
      {ok && <p className="text-xs text-emerald-400">Ajuste aplicado.</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary text-xs">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando…' : 'Aplicar ajuste'}
        </button>
      </div>
    </form>
  );
}