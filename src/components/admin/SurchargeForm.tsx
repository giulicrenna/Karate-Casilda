'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save } from 'lucide-react';

interface InitialData {
  id?: string;
  name?: string;
  graceDays?: number;
  surchargePct?: number;
  effectiveFrom?: string;
  effectiveUntil?: string | null;
  active?: boolean;
}

export default function SurchargeForm({ initial }: { initial?: InitialData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial?.id);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const effectiveFrom = fd.get('effectiveFrom') as string;
      const effectiveUntil = fd.get('effectiveUntil') as string;
      const body: Record<string, unknown> = {
        name: fd.get('name'),
        graceDays: Number(fd.get('graceDays')),
        surchargePct: Number(fd.get('surchargePct')),
        effectiveFrom: effectiveFrom
          ? new Date(effectiveFrom).toISOString()
          : new Date().toISOString(),
        effectiveUntil: effectiveUntil ? new Date(effectiveUntil).toISOString() : null,
        active: fd.get('active') === 'on',
      };
      const url = isEdit ? `/api/cuotas/surcharges/${initial!.id}` : '/api/cuotas/surcharges';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error desconocido' }));
        setError(data.error || 'No se pudo guardar.');
        return;
      }
      router.push('/admin/cuotas');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
      <Field label="Nombre" required>
        <input
          name="name"
          required
          minLength={2}
          defaultValue={initial?.name}
          className="input"
          placeholder="Recargo 10% a partir del día 11"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Días de gracia" required>
          <input
            name="graceDays"
            type="number"
            min="1"
            max="28"
            required
            defaultValue={initial?.graceDays ?? 10}
            className="input"
          />
          <p className="mt-1 text-xs text-ink-500">
            Día del mes a partir del cual aplica el recargo (ej: 10 = desde el día 11).
          </p>
        </Field>

        <Field label="Porcentaje de recargo" required>
          <input
            name="surchargePct"
            type="number"
            step="0.01"
            min="0"
            max="100"
            required
            defaultValue={initial?.surchargePct ?? 10}
            className="input"
            placeholder="10"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Vigente desde">
          <input
            name="effectiveFrom"
            type="date"
            defaultValue={
              initial?.effectiveFrom
                ? new Date(initial.effectiveFrom).toISOString().slice(0, 10)
                : ''
            }
            className="input"
          />
        </Field>
        <Field label="Vigente hasta (opcional)">
          <input
            name="effectiveUntil"
            type="date"
            defaultValue={
              initial?.effectiveUntil
                ? new Date(initial.effectiveUntil).toISOString().slice(0, 10)
                : ''
            }
            className="input"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input
          name="active"
          type="checkbox"
          defaultChecked={initial?.active ?? true}
          className="h-4 w-4 rounded-sm border-ink-700 bg-ink-900"
        />
        Activa
      </label>

      {error && (
        <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear regla'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.125rem;
          border: 1px solid rgb(38 38 38);
          background-color: rgb(10 10 10 / 0.6);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(245 245 245);
        }
        :global(.input:focus) {
          border-color: rgb(185 28 28);
          outline: none;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
        {label} {required && <span className="text-shiroi-500">*</span>}
      </label>
      {children}
    </div>
  );
}