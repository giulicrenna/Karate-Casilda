'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayCircle, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { CronStatus } from '@/types';

interface LastRun {
  startedAt: string;
  finishedAt: string | null;
  status: CronStatus;
  durationMs: number | null;
  errorMessage: string | null;
}

interface Props {
  jobName: 'monthly_debts' | 'overdue_check';
  title: string;
  description: string;
  schedule: string;
  lastRun: LastRun | null;
}

export default function CronJobCard({ jobName, title, description, schedule, lastRun }: Props) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/cron/${jobName === 'monthly_debts' ? 'monthly' : 'overdue'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error || 'Error al ejecutar el cron');
        return;
      }
      setResult(
        'Ejecución completada. La tabla de historial se actualizará en unos segundos.',
      );
      // Refrescar después de un delay para que termine de escribir el CronRun.
      setTimeout(() => router.refresh(), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="card-minimal p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-display text-lg text-ink-50">{title}</h2>
          <p className="text-xs text-ink-400 mt-1">{description}</p>
        </div>
        <div className="text-right text-xs text-ink-500">
          <div>Programado</div>
          <code className="text-[10px] text-shiroi-400">{schedule}</code>
        </div>
      </div>

      <div className="border-t border-ink-900 pt-3 mb-3">
        <div className="text-xs text-ink-500 mb-1">Última ejecución</div>
        {lastRun ? (
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <StatusBadge status={lastRun.status} />
            <span className="text-ink-300">
              {new Date(lastRun.startedAt).toLocaleString('es-AR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </span>
            {lastRun.durationMs !== null && (
              <span className="text-ink-500 text-xs">
                ({formatDuration(lastRun.durationMs)})
              </span>
            )}
            {lastRun.errorMessage && (
              <span
                className="text-shiroi-400 text-xs truncate max-w-md"
                title={lastRun.errorMessage}
              >
                · {lastRun.errorMessage}
              </span>
            )}
          </div>
        ) : (
          <div className="text-sm text-ink-500 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Nunca ejecutado
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={run}
        disabled={running}
        className="btn-primary w-full justify-center"
      >
        {running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Ejecutando…
          </>
        ) : (
          <>
            <PlayCircle className="h-4 w-4" />
            Ejecutar ahora
          </>
        )}
      </button>

      {error && <p className="mt-3 text-xs text-shiroi-400">{error}</p>}
      {result && <p className="mt-3 text-xs text-emerald-400">{result}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: CronStatus }) {
  if (status === 'running') {
    return (
      <span className="inline-flex items-center rounded-sm bg-steel-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-steel-400">
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
        Ejecutando
      </span>
    );
  }
  if (status === 'success') {
    return (
      <span className="inline-flex items-center rounded-sm bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-400">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Éxito
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-sm bg-shiroi-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-shiroi-400">
      <XCircle className="h-3 w-3 mr-1" />
      Error
    </span>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}
