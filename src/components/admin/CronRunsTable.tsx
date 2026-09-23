'use client';

import { useState } from 'react';
import { Filter, Loader2, CheckCircle2, XCircle, Eye } from 'lucide-react';
import type { CronRunDTO, CronStatus, CronTrigger, CronJobName } from '@/types';
import CronDetailModal from './CronDetailModal';

interface Props {
  runs: CronRunDTO[];
  total: number;
  offset: number;
  limit: number;
  filters: {
    jobName: CronJobName | '';
    status: CronStatus | '';
    trigger: CronTrigger | '';
    from: string;
    to: string;
  };
}

export default function CronRunsTable({ runs, total, offset, limit, filters }: Props) {
  const [selected, setSelected] = useState<CronRunDTO | null>(null);

  const prevOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  return (
    <>
      <form
        method="get"
        action="/admin/cron"
        className="card-minimal p-4 mb-6 grid grid-cols-1 gap-3 md:grid-cols-6"
      >
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Job
          </label>
          <select
            name="jobName"
            defaultValue={filters.jobName}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todos</option>
            <option value="monthly_debts">Generar deudas del mes</option>
            <option value="overdue_check">Verificar morosos</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Estado
          </label>
          <select
            name="status"
            defaultValue={filters.status}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todos</option>
            <option value="running">Ejecutando</option>
            <option value="success">Éxito</option>
            <option value="failed">Error</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Trigger
          </label>
          <select
            name="trigger"
            defaultValue={filters.trigger}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todos</option>
            <option value="cron_vercel">Vercel Cron</option>
            <option value="manual_admin">Manual admin</option>
            <option value="manual_superadmin">Manual superadmin</option>
            <option value="system">Sistema</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Desde
          </label>
          <input
            type="date"
            name="from"
            defaultValue={filters.from}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Hasta
          </label>
          <input
            type="date"
            name="to"
            defaultValue={filters.to}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary text-xs w-full justify-center">
            <Filter className="h-4 w-4" />
            Aplicar
          </button>
        </div>
      </form>

      {runs.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">No hay ejecuciones para los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Trigger</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 hidden md:table-cell">Duración</th>
                <th className="px-4 py-3 hidden lg:table-cell">Por</th>
                <th className="px-4 py-3 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-ink-900/30">
                  <td className="px-4 py-3 text-xs text-ink-400 whitespace-nowrap">
                    {new Date(r.startedAt).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-200">
                    {jobLabel(r.jobName)}
                  </td>
                  <td className="px-4 py-3">
                    <TriggerBadge trigger={r.trigger} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-300 hidden md:table-cell">
                    {r.durationMs !== null ? formatDuration(r.durationMs) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-400 hidden lg:table-cell truncate max-w-[180px]">
                    {r.triggeredByEmail ?? (r.triggeredBy ? '—' : 'Vercel')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="text-xs text-shiroi-400 hover:text-shiroi-300 inline-flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > limit && (
        <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
          <div>
            Mostrando {offset + 1}–{Math.min(offset + limit, total)} de {total}
          </div>
          <div className="flex items-center gap-2">
            {hasPrev && (
              <a
                href={buildHref(filters, prevOffset)}
                className="btn-secondary text-xs"
              >
                ← Anterior
              </a>
            )}
            {hasNext && (
              <a
                href={buildHref(filters, nextOffset)}
                className="btn-secondary text-xs"
              >
                Siguiente →
              </a>
            )}
          </div>
        </div>
      )}

      <CronDetailModal run={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function buildHref(
  filters: Props['filters'],
  newOffset: number,
): string {
  const params = new URLSearchParams();
  if (filters.jobName) params.set('jobName', filters.jobName);
  if (filters.status) params.set('status', filters.status);
  if (filters.trigger) params.set('trigger', filters.trigger);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (newOffset > 0) params.set('offset', String(newOffset));
  const qs = params.toString();
  return qs ? `/admin/cron?${qs}` : '/admin/cron';
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
