'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function IncomeRowActions({ id, description }: { id: string; description: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    if (!confirm(`¿Eliminar el ingreso "${description}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pagos/incomes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('No se pudo eliminar el ingreso.');
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
        href={`/admin/pagos/ingresos/${id}`}
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
