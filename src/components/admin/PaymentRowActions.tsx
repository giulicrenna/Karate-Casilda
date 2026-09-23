'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban } from 'lucide-react';

export default function PaymentRowActions({
  paymentId,
  status,
}: {
  paymentId: string;
  status: string;
}) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  if (status === 'cancelled' || status === 'refunded') return null;

  const cancel = async () => {
    if (!confirm('¿Anular este pago? La deuda asociada se recalculará.')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/pagos/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error' }));
        alert(data.error || 'No se pudo anular el pago.');
        return;
      }
      router.refresh();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={cancelling}
      className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-shiroi-950 hover:text-shiroi-400 disabled:opacity-50"
      aria-label="Anular pago"
      title="Anular pago"
    >
      <Ban className="h-3.5 w-3.5" />
    </button>
  );
}