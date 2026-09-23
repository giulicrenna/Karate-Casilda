'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  id: string;
  name: string;
  isSelf: boolean;
}

export default function AdminUserRowActions({ id, name, isSelf }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (isSelf) {
      alert('No podés eliminar tu propio usuario.');
      return;
    }
    if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin-users/${id}`, { method: 'DELETE' });
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
        href={`/admin/usuarios/${id}`}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-shiroi-400"
        aria-label="Editar"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy || isSelf}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-shiroi-950 hover:text-shiroi-400 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Eliminar"
        title={isSelf ? 'No podés eliminarte a vos mismo' : 'Eliminar'}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}