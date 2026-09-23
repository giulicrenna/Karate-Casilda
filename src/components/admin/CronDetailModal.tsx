'use client';

import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { CronRunDTO, CronStatus, CronTrigger, CronJobName } from '@/types';

interface Props {
  run: CronRunDTO | null;
  onClose: () => void;
}

export default function CronDetailModal({ run, onClose }: Props) {
  // Cerrar con ESC
  useEffect(() => {
    if (!run) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [run, onClose]);

  if (!run) return null;

  const prettyMetadata = run.metadata ? JSON.stringify(run.metadata, null, 2) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card-minimal w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-ink-800 p-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-shiroi-500">
              Detalle de ejecución
            </div>
            <h2 className="font-display text-lg text-ink-50 mt-0.5">
              {jobLabel(run.jobName)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1.5 text-ink-400 hover:text-ink-100 hover:bg-ink-900"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-y-auto p-4 space-y-4 text-sm">
          <Field label="ID">{run.id}</Field>
          <Field label="Job">{jobLabel(run.jobName)}</Field>
          <Field label="Status">
            <StatusBadge status={run.status} />
          </Field>
          <Field label="Trigger">
            <TriggerBadge trigger={run.trigger} />
          </Field>
          <Field label="Iniciado">
            {new Date(run.startedAt).toLocaleString('es-AR', {
              dateStyle: 'medium',
              timeStyle: 'medium',
            })}
          </Field>
          <Field label="Finalizado">
            {run.finishedAt
              ? new Date(run.finishedAt).toLocaleString('es-AR', {
                  dateStyle: 'medium',
                  timeStyle: 'medium',
                })
              : '— (en curso)'}
          </Field>
          <Field label="Duración">
            {run.durationMs !== null ? formatDuration(run.durationMs) : '—'}
          </Field>
          <Field label="Disparado por">
            {run.triggeredByEmail ?? (run.triggeredBy ?? '—')}
          </Field>

          {run.errorMessage && (
            <div className="rounded-sm border border-shiroi-700 bg-shiroi-900/30 p-3">
              <div className="flex items-center gap-2 text-shiroi-300 text-xs uppercase tracking-wider mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Error
              </div>
              <pre className="text-xs text-shiroi-200 whitespace-pre-wrap break-words font-mono">
                {run.errorMessage}
              </pre>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-1.5">
              Metadata
            </div>
            {prettyMetadata ? (
              <pre className="overflow-x-auto rounded-sm border border-ink-800 bg-ink-950 p-3 font-mono text-xs text-ink-200 max-h-72">
                {prettyMetadata}
              </pre>
            ) : (
              <div className="text-xs text-ink-500 italic">Sin metadata</div>
            )}
          </div>
        </div>

        <footer className="border-t border-ink-800 p-3 flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className="col-span-2 text-ink-200 break-words">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: CronStatus }) {
  const map: Record<CronStatus, string> = {
    running: 'bg-steel-500/20 text-steel-400',
    success: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-shiroi-500/20 text-shiroi-400',
  };
  const label: Record<CronStatus, string> = {
    running: 'Ejecutando',
    success: 'Éxito',
    failed: 'Error',
  };
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}

function TriggerBadge({ trigger }: { trigger: CronTrigger }) {
  const map: Record<CronTrigger, string> = {
    cron_vercel: 'bg-ink-800 text-ink-300',
    manual_admin: 'bg-shiroi-900/30 text-shiroi-300',
    manual_superadmin: 'bg-amber-900/30 text-amber-300',
    system: 'bg-ink-800 text-ink-400',
  };
  const label: Record<CronTrigger, string> = {
    cron_vercel: 'Vercel Cron',
    manual_admin: 'Manual admin',
    manual_superadmin: 'Manual superadmin',
    system: 'Sistema',
  };
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ${map[trigger]}`}
    >
      {label[trigger]}
    </span>
  );
}

function jobLabel(job: CronJobName): string {
  if (job === 'monthly_debts') return 'Generar deudas del mes';
  return 'Verificar morosos';
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}
