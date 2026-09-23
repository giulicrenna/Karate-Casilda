'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Save } from 'lucide-react';

interface InitialData {
  id?: string;
  name?: string;
  photoDriveFileId?: string | null;
  active?: boolean;
}

interface Props {
  initial?: InitialData;
}

export default function AuthorForm({ initial }: Props) {
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial?.id);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const body = {
        name: fd.get('name'),
        photoDriveFileId: fd.get('photoDriveFileId') || null,
        active: fd.get('active') === 'on',
      };
      const url = isEdit ? `/api/authors/${initial!.id}` : '/api/authors';
      const method = isEdit ? 'PUT' : 'POST';
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
      router.push('/admin/autores');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
      <Field label="Nombre" required>
        <input
          name="name"
          required
          minLength={2}
          maxLength={120}
          defaultValue={initial?.name}
          className="input"
          placeholder="Sensei Juan Pérez"
        />
      </Field>

      <Field label="Foto (ID de archivo en Drive)" hint="Opcional. Si está vacío se mostrarán las iniciales en un círculo.">
        <div className="flex gap-2">
          <input
            ref={photoRef}
            name="photoDriveFileId"
            type="text"
            defaultValue={initial?.photoDriveFileId ?? ''}
            className="input flex-1 font-mono text-xs"
            placeholder="1AbC...dEf"
          />
          <button
            type="button"
            disabled={!photoRef.current?.value}
            onClick={() => {
              const v = photoRef.current?.value?.trim();
              if (v) window.open(`/api/thumb/${encodeURIComponent(v)}?size=400`, '_blank');
            }}
            className="btn-secondary text-xs"
          >
            Probar
          </button>
        </div>
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input
          name="active"
          type="checkbox"
          defaultChecked={initial?.active ?? true}
          className="h-4 w-4 rounded-sm border-ink-700 bg-ink-900"
        />
        Activo (visible en el selector al crear artículos)
      </label>

      {error && (
        <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear autor'}
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
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
        {label} {required && <span className="text-shiroi-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-500">{hint}</p>}
    </div>
  );
}