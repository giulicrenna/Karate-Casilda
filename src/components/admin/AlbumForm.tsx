'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save } from 'lucide-react';

interface Props {
  events: Array<{ id: string; title: string }>;
  initial?: {
    id?: string;
    title?: string;
    slug?: string;
    description?: string | null;
    date?: string;
    driveFolderId?: string;
    driveFolderPath?: string | null;
    coverImageId?: string | null;
    featured?: boolean;
    published?: boolean;
  };
}

export default function AlbumForm({ initial }: Props) {
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
      const body = {
        title: fd.get('title'),
        description: fd.get('description') || null,
        date: new Date(fd.get('date') as string).toISOString(),
        driveFolderId: fd.get('driveFolderId'),
        driveFolderPath: fd.get('driveFolderPath') || null,
        coverImageId: fd.get('coverImageId') || null,
        featured: fd.get('featured') === 'on',
        published: fd.get('published') === 'on',
      };
      const url = isEdit ? `/api/albums/${initial!.id}` : '/api/albums';
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
      const data = await res.json();
      // Sincronizar después de crear
      if (!isEdit && data.id) {
        await fetch(`/api/albums/${data.id}/sync`, { method: 'POST' });
      } else if (isEdit) {
        await fetch(`/api/albums/${data.id}/sync`, { method: 'POST' });
      }
      router.push('/admin/albumes');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
      <Field label="Título del álbum" required>
        <input name="title" required minLength={3} defaultValue={initial?.title} className="input" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Fecha" required>
          <input
            name="date"
            type="date"
            required
            defaultValue={initial?.date}
            className="input"
          />
        </Field>
        <Field
          label="ID de carpeta de Google Drive"
          required
          hint="Lo encontrás en la URL cuando abrís la carpeta en Drive. Ej: 1A2B3C4D5E6F7G8H9"
        >
          <input
            name="driveFolderId"
            required
            defaultValue={initial?.driveFolderId}
            placeholder="1xxxxxxxxxxxxxxxxxxxxxxx"
            className="input font-mono text-xs"
          />
        </Field>
      </div>

      <Field label="Ruta legible (opcional)" hint="Para tu referencia: ej. 'Karate Casilda / 2026 / Torneo Casilda'">
        <input
          name="driveFolderPath"
          defaultValue={initial?.driveFolderPath ?? ''}
          className="input"
        />
      </Field>

      <Field
        label="ID de imagen de portada (opcional)"
        hint="ID de Google Drive de la foto que se mostrará como portada."
      >
        <input
          name="coverImageId"
          defaultValue={initial?.coverImageId ?? ''}
          placeholder="1xxxxxxxxxxxxxxxxxxxxxxx"
          className="input font-mono text-xs"
        />
      </Field>

      <Field label="Descripción">
        <textarea
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ''}
          className="input resize-y"
        />
      </Field>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-ink-200">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={initial?.featured ?? false}
            className="h-4 w-4 rounded-sm border-ink-700 bg-ink-900"
          />
          Álbum destacado (aparece en Home)
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-200">
          <input
            name="published"
            type="checkbox"
            defaultChecked={initial?.published ?? true}
            className="h-4 w-4 rounded-sm border-ink-700 bg-ink-900"
          />
          Publicado
        </label>
      </div>

      {error && (
        <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando y sincronizando…' : isEdit ? 'Guardar cambios' : 'Crear álbum y sincronizar'}
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
