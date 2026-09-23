'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Loggear a consola del servidor (en producción, enviá a tu servicio de monitoring)
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-display text-7xl text-shiroi-700 mb-4">⚠</div>
        <h1 className="font-display text-2xl text-ink-50 mb-3">Algo salió mal</h1>
        <p className="text-sm text-ink-400 mb-6">
          Ocurrió un error inesperado. Por favor intentá nuevamente.
        </p>
        <button onClick={() => reset()} className="btn-primary">
          Reintentar
        </button>
      </div>
    </div>
  );
}
