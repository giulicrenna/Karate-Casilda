import Link from 'next/link';
import { Timer, Filter } from 'lucide-react';
import { requireRole, ADMIN, SUPERADMIN } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import CronJobCard from '@/components/admin/CronJobCard';
import CronRunsTable from '@/components/admin/CronRunsTable';
import type { CronJobName, CronStatus, CronTrigger, CronRunDTO } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cron jobs', robots: { index: false, follow: false } };

const PAGE_SIZE = 20;

const ALLOWED_JOB = ['monthly_debts', 'overdue_check'] as const;
const ALLOWED_STATUS = ['running', 'success', 'failed'] as const;
const ALLOWED_TRIGGER = [
  'cron_vercel',
  'manual_admin',
  'manual_superadmin',
  'system',
] as const;

type SearchParams = {
  jobName?: string;
  status?: string;
  trigger?: string;
  from?: string;
  to?: string;
  offset?: string;
};

export default async function AdminCronPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Permitimos admin y superadmin (los editores no).
  const session = await requireRole(SUPERADMIN, ADMIN);

  const jobName = (ALLOWED_JOB as readonly string[]).includes(searchParams.jobName ?? '')
    ? (searchParams.jobName as CronJobName)
    : '';
  const status = (ALLOWED_STATUS as readonly string[]).includes(searchParams.status ?? '')
    ? (searchParams.status as CronStatus)
    : '';
  const trigger = (ALLOWED_TRIGGER as readonly string[]).includes(searchParams.trigger ?? '')
    ? (searchParams.trigger as CronTrigger)
    : '';
  const from = searchParams.from ?? '';
  const to = searchParams.to ?? '';
  const offset = Math.max(parseInt(searchParams.offset ?? '0', 10) || 0, 0);

  const where: Record<string, unknown> = {};
  if (jobName) where.jobName = jobName;
  if (status) where.status = status;
  if (trigger) where.trigger = trigger;
  if (from || to) {
    const startedAt: Record<string, Date> = {};
    if (from) startedAt.gte = new Date(`${from}T00:00:00`);
    if (to) {
      const d = new Date(`${to}T00:00:00`);
      d.setHours(23, 59, 59, 999);
      startedAt.lte = d;
    }
    where.startedAt = startedAt;
  }

  // Última ejecución de cada job (en paralelo).
  const [lastMonthly, lastOverdue, items, total] = await Promise.all([
    prisma.cronRun.findFirst({
      where: { jobName: 'monthly_debts' },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.cronRun.findFirst({
      where: { jobName: 'overdue_check' },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.cronRun.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: PAGE_SIZE,
      skip: offset,
    }),
    prisma.cronRun.count({ where }),
  ]);

  // Hidratar el email del admin que disparó (solo si hay triggeredBy)
  const userIds = Array.from(
    new Set(
      items
        .map((r) => r.triggeredBy)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const users =
    userIds.length > 0
      ? await prisma.adminUser.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        })
      : [];
  const userMap = new Map(users.map((u) => [u.id, u.email]));

  const runsDTO: CronRunDTO[] = items.map((r) => ({
    id: r.id,
    jobName: r.jobName as CronJobName,
    status: r.status as CronStatus,
    trigger: r.trigger as CronTrigger,
    triggeredBy: r.triggeredBy,
    triggeredByEmail: r.triggeredBy ? userMap.get(r.triggeredBy) ?? null : null,
    startedAt: r.startedAt.toISOString(),
    finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
    durationMs: r.durationMs,
    metadata: r.metadata ? safeParseJson(r.metadata) : null,
    errorMessage: r.errorMessage,
  }));

  const lastRunDTO = (
    run: typeof lastMonthly,
  ): {
    startedAt: string;
    finishedAt: string | null;
    status: CronStatus;
    durationMs: number | null;
    errorMessage: string | null;
  } | null => {
    if (!run) return null;
    return {
      startedAt: run.startedAt.toISOString(),
      finishedAt: run.finishedAt ? run.finishedAt.toISOString() : null,
      status: run.status as CronStatus,
      durationMs: run.durationMs,
      errorMessage: run.errorMessage,
    };
  };

  return (
    <AdminShell role={session.role}>
      <header className="flex flex-col gap-3 border-b border-ink-900 pb-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">
            Administración
          </div>
          <h1 className="font-display text-2xl text-ink-50 flex items-center gap-2">
            <Timer className="h-6 w-6 text-shiroi-500" />
            Cron jobs
          </h1>
          <p className="mt-1 text-xs text-ink-500">
            Ejecución manual y bitácora de los jobs programados (Vercel Cron + disparos
            desde el panel).
          </p>
        </div>
        <div className="text-xs text-ink-400">
          {total} ejecución{total === 1 ? '' : 'es'} en el historial
        </div>
      </header>

      {/* Cards por job */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-10">
        <CronJobCard
          jobName="monthly_debts"
          title="Generar deudas del mes"
          description="Genera las deudas del período (por defecto el mes anterior), envía recordatorios por email/WhatsApp y registra auditoría."
          schedule="5 0 1 * * (día 1 de cada mes, 00:05 UTC)"
          lastRun={lastRunDTO(lastMonthly)}
        />
        <CronJobCard
          jobName="overdue_check"
          title="Verificar morosos"
          description="Marca deudas vencidas como overdue y envía notificaciones con dedup diaria."
          schedule="0 13 * * (todos los días, 13:00 UTC)"
          lastRun={lastRunDTO(lastOverdue)}
        />
      </section>

      {/* Tabla de historial */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-ink-100 flex items-center gap-2">
            <Filter className="h-4 w-4 text-shiroi-500" />
            Historial de ejecuciones
          </h2>
          {(jobName || status || trigger || from || to) && (
            <Link href="/admin/cron" className="btn-secondary text-xs">
              Limpiar filtros
            </Link>
          )}
        </div>
        <CronRunsTable
          runs={runsDTO}
          total={total}
          offset={offset}
          limit={PAGE_SIZE}
          filters={{
            jobName,
            status,
            trigger,
            from,
            to,
          }}
        />
      </section>
    </AdminShell>
  );
}

function safeParseJson(s: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(s);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // ignore
  }
  return null;
}
