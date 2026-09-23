'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Save } from 'lucide-react';
import { ARTICLE_CATEGORIES } from '@/lib/constants';
import ImageFromDriveButton from '@/components/admin/ImageFromDriveButton';

interface InitialData {
  id?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  category?: string;
  coverDriveFileId?: string | null;
  published?: boolean;
  authorId?: string;
}

interface AuthorOption {
  id: string;
  name: string;
  photoDriveFileId: string | null;
  active: boolean;
}

interface Props {
  authors: AuthorOption[];
  initial?: InitialData;
}

export default function ArticleForm({ authors, initial }: Props) {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
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
        excerpt: fd.get('excerpt'),
        body: fd.get('body'),
        category: fd.get('category'),
        coverDriveFileId: fd.get('coverDriveFileId') || null,
        published: fd.get('published') === 'on',
        authorId: fd.get('authorId'),
      };
      const url = isEdit ? `/api/articles/${initial!.id}` : '/api/articles';
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
      router.push('/admin/articulos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const insertDriveImage = (fileId: string, alt: string) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const safeAlt = alt || 'imagen';
    const snippet = `![${safeAlt}](drive:${fileId})`;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(end);
    const insert = (before.endsWith('\n\n') || before.length === 0 ? '' : '\n\n') + snippet + '\n\n';
    ta.value = before + insert + after;
  };

  const activeAuthors = authors.filter((a) => a.active);
  const inactiveAuthors = authors.filter((a) => !a.active);

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
      <Field label="Título" required>
        <input
          name="title"
          required
          minLength={3}
          maxLength={160}
          defaultValue={initial?.title}
          className="input"
        />
      </Field>

      <Field label="Resumen" required hint="Resumen corto que se muestra en la card y en SEO. 10 a 300 caracteres.">
        <textarea
          name="excerpt"
          required
          minLength={10}
          maxLength={300}
          rows={3}
          defaultValue={initial?.excerpt}
          className="input resize-y"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Categoría" required>
          <select name="category" required defaultValue={initial?.category ?? 'general'} className="input">
            {ARTICLE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Autor" required>
          <select
            name="authorId"
            required
            defaultValue={initial?.authorId ?? activeAuthors[0]?.id ?? ''}
            className="input"
          >
            {activeAuthors.length === 0 && (
              <option value="" disabled>
                (creá un autor primero)
              </option>
            )}
            {activeAuthors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
            {inactiveAuthors.length > 0 && (
              <optgroup label="Archivados">
                {inactiveAuthors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (archivado)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </Field>
      </div>

      <Field label="Imagen de portada" hint="ID de un archivo de Google Drive. Se sirve por el proxy del sitio.">
        <div className="flex gap-2">
          <input
            ref={coverRef}
            name="coverDriveFileId"
            type="text"
            defaultValue={initial?.coverDriveFileId ?? ''}
            className="input flex-1 font-mono text-xs"
            placeholder="1AbC...dEf"
          />
          <button
            type="button"
            disabled={!coverRef.current?.value}
            onClick={() => {
              const v = coverRef.current?.value?.trim();
              if (v) window.open(`/api/thumb/${encodeURIComponent(v)}?size=400`, '_blank');
            }}
            className="btn-secondary text-xs"
          >
            Probar
          </button>
        </div>
      </Field>

      <Field
        label="Contenido (markdown)"
        required
        hint="Soporta títulos, listas, negrita, itálica, links e imágenes. Insertá imágenes de Drive con el botón."
      >
        <textarea
          ref={bodyRef}
          name="body"
          required
          rows={16}
          minLength={20}
          defaultValue={initial?.body}
          className="input resize-y font-mono text-sm"
          placeholder={'## Subtítulo\n\nTexto del artículo con **negrita** y *itálica*.\n\n- Lista\n- Lista\n\n![descripción](drive:FILE_ID)'}
        />
        <div className="mt-2 flex justify-end">
          <ImageFromDriveButton onInsert={insertDriveImage} />
        </div>
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink-200">
        <input
          name="published"
          type="checkbox"
          defaultChecked={initial?.published ?? true}
          className="h-4 w-4 rounded-sm border-ink-700 bg-ink-900"
        />
        Publicado
      </label>

      {error && (
        <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear artículo'}
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