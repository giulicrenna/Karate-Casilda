'use client';

import Link from 'next/link';
import { Pencil, Archive, Trash2, ArchiveRestore } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  id: string;
  name: string;
  active: boolean;
  articleCount: number;
}

export default function AuthorRowActions({ id, name, active, articleCount }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggleActive = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/authors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, active: !active }),
      });
      if (!res.ok) {
        alert('No se pudo actualizar.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (articleCount > 0) {
      alert(
        `Este autor tiene ${articleCount} artículo(s) asociado(s). Se recomienda archivarlo en lugar de eliminarlo.`
      );
      return;
    }
    if (!confirm(`¿Eliminar autor "${name}"? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error' }));
        alert(data.error || 'No se pudo eliminar.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      <Link
        href={`/admin/autores/${id}`}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-shiroi-400"
        aria-label="Editar"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <button
        type="button"
        onClick={toggleActive}
        disabled={busy}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-shiroi-400 disabled:opacity-50"
        aria-label={active ? 'Archivar' : 'Reactivar'}
        title={active ? 'Archivar' : 'Reactivar'}
      >
        {active ? <Archive className="h-3.5 w-3.5" /> : <ArchiveRestore className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-shiroi-950 hover:text-shiroi-400 disabled:opacity-50"
        aria-label="Eliminar"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}