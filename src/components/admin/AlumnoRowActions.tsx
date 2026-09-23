'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pencil, Power } from 'lucide-react';

interface Props {
  id: string;
  active: boolean;
}

export default function AlumnoRowActions({ id, active }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggleActive = async () => {
    const next = !active;
    const ok = confirm(
      next
        ? '¿Reactivar este alumno?'
        : '¿Desactivar este alumno? Esto es un baja lógica: no podrá iniciar sesión.'
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/alumnos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error' }));
        alert(data.error || 'No se pudo actualizar.');
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
        href={`/admin/alumnos/${id}`}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-shiroi-400"
        aria-label="Ver detalle"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <button
        type="button"
        onClick={toggleActive}
        disabled={busy}
        className={`grid h-8 w-8 place-items-center rounded-sm disabled:opacity-50 ${
          active
            ? 'text-ink-400 hover:bg-amber-950 hover:text-amber-300'
            : 'text-amber-400 hover:bg-emerald-950 hover:text-emerald-300'
        }`}
        aria-label={active ? 'Desactivar' : 'Activar'}
        title={active ? 'Desactivar' : 'Activar'}
      >
        <Power className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}