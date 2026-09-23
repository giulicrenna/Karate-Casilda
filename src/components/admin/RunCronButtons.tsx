'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Bell, ChevronDown } from 'lucide-react';

interface Result {
  generated?: number;
  skipped?: number;
  errors?: string[];
  notificationsSent?: number;
  periodYear?: number;
  periodMonth?: number;
  markedOverdue?: number;
}

export default function RunCronButtons() {
  const router = useRouter();
  const [runningMonthly, setRunningMonthly] = useState(false);
  const [runningOverdue, setRunningOverdue] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const runMonthly = async () => {
    setRunningMonthly(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/cron/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data: Result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (data as unknown as { error?: string }).error ||
            'No se pudo correr el cron mensual.',
        );
        return;
      }
      setResult(
        `Mensual OK · Generadas: ${data.generated ?? 0} · Omitidas: ${data.skipped ?? 0}` +
          ` · Notificaciones: ${data.notificationsSent ?? 0}` +
          `${data.errors && data.errors.length > 0 ? ` · Errores: ${data.errors.length}` : ''}` +
          (data.periodYear && data.periodMonth
            ? ` · Período: ${data.periodMonth}/${data.periodYear}`
            : ''),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRunningMonthly(false);
    }
  };

  const runOverdue = async () => {
    setRunningOverdue(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/cron/overdue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data: Result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (data as unknown as { error?: string }).error ||
            'No se pudo correr el cron de morosos.',
        );
        return;
      }
      setResult(
        `Morosos OK · Marcadas: ${data.markedOverdue ?? 0} · Notificaciones: ${data.notificationsSent ?? 0}`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRunningOverdue(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-secondary text-xs"
        aria-expanded={open}
      >
        <CalendarClock className="h-4 w-4" />
        Cron manual
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-ink-800 bg-ink-950 p-4 shadow-xl z-20">
          <p className="text-xs text-ink-400 mb-3">
            Dispara manualmente los cron jobs. Útil para testing o cuando se
            quiere forzar la ejecución sin esperar a Vercel.
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={runMonthly}
              disabled={runningMonthly}
              className="btn-primary text-xs w-full justify-start"
            >
              <CalendarClock className="h-4 w-4" />
              {runningMonthly ? 'Generando…' : 'Generar deudas del mes (cron)'}
            </button>

            <button
              type="button"
              onClick={runOverdue}
              disabled={runningOverdue}
              className="btn-secondary text-xs w-full justify-start"
            >
              <Bell className="h-4 w-4" />
              {runningOverdue ? 'Verificando…' : 'Verificar morosos (cron)'}
            </button>
          </div>

          {error && <p className="mt-3 text-xs text-shiroi-400">{error}</p>}
          {result && <p className="mt-3 text-xs text-emerald-400">{result}</p>}

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-ink-500 hover:text-ink-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}