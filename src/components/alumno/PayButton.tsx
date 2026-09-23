'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

interface Props {
  debtIds: string[];
  label?: string;
  /** Cuando false, no permite pagar (ej: MP no configurado). */
  configured?: boolean;
  className?: string;
}

/**
 * Botón de pago con Mercado Pago.
 * Llama a `POST /api/pagos/checkout` con los `debtIds` seleccionados y,
 * si la respuesta trae `initPoint`, redirige al checkout de MP.
 */
export default function PayButton({
  debtIds,
  label = 'Pagar con Mercado Pago',
  configured = true,
  className = '',
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <div className={className}>
        <div
          className="rounded-md border border-dashed border-ink-800 bg-ink-900/30 p-3 text-xs text-ink-400"
          role="alert"
        >
          La pasarela de pago no está disponible por el momento. Contactá al dojo para
          coordinar el pago.
        </div>
      </div>
    );
  }

  if (debtIds.length === 0) {
    return null;
  }

  async function handlePay() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/pagos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debtIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data && data.error) || 'Error al iniciar el pago.');
      }
      if (data && typeof data.initPoint === 'string' && data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      throw new Error('No se recibió la URL de pago.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handlePay}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-sm bg-shiroi-700 px-4 py-2 text-sm font-semibold text-ink-50 shadow-sm transition-colors hover:bg-shiroi-600 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {busy ? 'Conectando con Mercado Pago…' : label}
      </button>
      {error && (
        <p className="mt-2 text-xs text-shiroi-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
