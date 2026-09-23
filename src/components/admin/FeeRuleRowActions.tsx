'use client';

import Link from 'next/link';
import { Pencil, Power, PowerOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FeeRuleRowActions({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const toggle = async () => {
    if (!confirm(`¿${active ? 'Desactivar' : 'Activar'} esta regla?`)) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/cuotas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      if (!res.ok) {
        alert('No se pudo cambiar el estado.');
        return;
      }
      router.refresh();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      <Link
        href={`/admin/cuotas/${id}`}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-shiroi-400"
        aria-label="Editar"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <button
        type="button"
        onClick={toggle}
        disabled={updating}
        className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-shiroi-400 disabled:opacity-50"
        aria-label={active ? 'Desactivar' : 'Activar'}
      >
        {active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}