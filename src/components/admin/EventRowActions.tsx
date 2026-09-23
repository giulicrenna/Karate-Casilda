'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EventRowActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    if (!confirm(`¿Eliminar evento "${title}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('No se pudo eliminar el evento.');
        return;
      }
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      <Link
        href={`/admin/eventos/${id}`}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-shiroi-400"
        aria-label="Editar"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-shiroi-950 hover:text-shiroi-400 disabled:opacity-50"
        aria-label="Eliminar"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
