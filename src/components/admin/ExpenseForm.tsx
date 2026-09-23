'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save } from 'lucide-react';

interface InitialData {
  id?: string;
  category?: string;
  description?: string;
  amount?: number;
  occurredAt?: string;
  vendor?: string | null;
  receiptDriveFileId?: string | null;
  notes?: string | null;
}

const CATEGORIES = [
  { value: 'alquiler', label: 'Alquiler' },
  { value: 'sueldos', label: 'Sueldos' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'insumos', label: 'Insumos' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'impuestos', label: 'Impuestos' },
  { value: 'otro', label: 'Otro' },
];

export default function ExpenseForm({ initial }: { initial?: InitialData }) {
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
      const body: Record<string, unknown> = {
        category: fd.get('category'),
        description: fd.get('description'),
        amount: Number(fd.get('amount')),
        occurredAt: new Date(fd.get('occurredAt') as string).toISOString(),
        vendor: (fd.get('vendor') as string) || null,
        receiptDriveFileId: (fd.get('receiptDriveFileId') as string) || null,
        notes: (fd.get('notes') as string) || null,
      };
      const url = isEdit ? `/api/pagos/expenses/${initial!.id}` : '/api/pagos/expenses';
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
      router.push('/admin/pagos/gastos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Categoría" required>
          <select
            name="category"
            required
            defaultValue={initial?.category ?? 'servicios'}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Monto (ARS)" required>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={initial?.amount ?? ''}
            className="input"
            placeholder="0.00"
          />
        </Field>
      </div>

      <Field label="Descripción" required>
        <input
          name="description"
          required
          minLength={2}
          maxLength={300}
          defaultValue={initial?.description ?? ''}
          className="input"
          placeholder="Ej: Pago de luz mes de marzo"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Fecha del gasto" required>
          <input
            name="occurredAt"
            type="date"
            required
            defaultValue={
              initial?.occurredAt
                ? new Date(initial.occurredAt).toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10)
            }
            className="input"
          />
        </Field>

        <Field label="Proveedor">
          <input
            name="vendor"
            defaultValue={initial?.vendor ?? ''}
            className="input"
            placeholder="Opcional"
          />
        </Field>
      </div>

      <Field label="ID de archivo en Drive (recibo)">
        <input
          name="receiptDriveFileId"
          defaultValue={initial?.receiptDriveFileId ?? ''}
          className="input"
          placeholder="Opcional"
        />
      </Field>

      <Field label="Notas">
        <textarea
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ''}
          className="input resize-y"
          placeholder="Opcional"
        />
      </Field>

      {error && (
        <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear gasto'}
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