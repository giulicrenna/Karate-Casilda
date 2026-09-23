'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save } from 'lucide-react';

interface InitialData {
  id?: string;
  title?: string;
  slug?: string;
  date?: string;
  location?: string | null;
  description?: string;
  category?: 'torneo' | 'examen' | 'seminario' | 'exhibicion' | 'entrenamiento' | 'otro';
  coverImage?: string | null;
  status?: 'upcoming' | 'past' | 'cancelled';
  featured?: boolean;
  albumId?: string | null;
}

interface Props {
  albums: Array<{ id: string; title: string }>;
  initial?: InitialData;
}

const CATEGORIES = [
  { value: 'torneo', label: 'Torneo' },
  { value: 'examen', label: 'Examen' },
  { value: 'seminario', label: 'Seminario' },
  { value: 'exhibicion', label: 'Exhibición' },
  { value: 'entrenamiento', label: 'Entrenamiento' },
  { value: 'otro', label: 'Otro' },
];

export default function EventForm({ albums, initial }: Props) {
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
        date: new Date(fd.get('date') as string).toISOString(),
        location: fd.get('location') || null,
        description: fd.get('description'),
        category: fd.get('category'),
        coverImage: fd.get('coverImage') || null,
        status: fd.get('status'),
        featured: fd.get('featured') === 'on',
        albumId: fd.get('albumId') || null,
      };
      const url = isEdit ? `/api/events/${initial!.id}` : '/api/events';
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
      router.push('/admin/eventos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
      <Field label="Título" required>
        <input
          name="title"
          required
          minLength={3}
          defaultValue={initial?.title}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Fecha y hora" required>
          <input
            name="date"
            type="datetime-local"
            required
            defaultValue={initial?.date}
            className="input"
          />
        </Field>
        <Field label="Lugar">
          <input
            name="location"
            defaultValue={initial?.location ?? ''}
            className="input"
            placeholder="Casilda, Santa Fe"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Categoría" required>
          <select name="category" required defaultValue={initial?.category ?? 'seminario'} className="input">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estado">
          <select name="status" defaultValue={initial?.status ?? 'upcoming'} className="input">
            <option value="upcoming">Próximo</option>
            <option value="past">Pasado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </Field>
        <Field label="Álbum asociado">
          <select name="albumId" defaultValue={initial?.albumId ?? ''} className="input">
            <option value="">— Ninguno —</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Imagen de portada (URL)">
        <input
          name="coverImage"
          type="url"
          defaultValue={initial?.coverImage ?? ''}
          className="input"
          placeholder="https://..."
        />
      </Field>

      <Field label="Descripción" required>
        <textarea
          name="description"
          required
          rows={10}
          defaultValue={initial?.description}
          className="input resize-y"
          placeholder="Markdown básico: **negrita**, *itálica*, # títulos"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input
          name="featured"
          type="checkbox"
          defaultChecked={initial?.featured ?? false}
          className="h-4 w-4 rounded-sm border-ink-700 bg-ink-900"
        />
        Marcar como evento destacado
      </label>

      {error && (
        <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear evento'}
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
        {label} {required && <span className="text-shiroi-500">*</span>}
      </label>
      {children}
    </div>
  );
}
