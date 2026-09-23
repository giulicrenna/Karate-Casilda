'use client';

import Link from 'next/link';
import { Pencil, Trash2, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AlbumRowActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!confirm(`¿Eliminar álbum "${title}"? Se borrará también el caché de fotos.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/albums/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('No se pudo eliminar el álbum.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const onSync = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/albums/${id}/sync`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'No se pudo sincronizar.');
        return;
      }
      alert(`Sincronizado: ${data.count} fotos.`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onSync}
        disabled={busy}
        title="Sincronizar con Drive"
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-shiroi-400 disabled:opacity-50"
        aria-label="Sincronizar"
      >
        <RefreshCcw className="h-3.5 w-3.5" />
      </button>
      <Link
        href={`/admin/albumes/${id}`}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-shiroi-400"
        aria-label="Editar"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
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
