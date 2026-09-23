import Link from 'next/link';
import { Bell, Filter, Mail, MessageCircle } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Notificaciones',
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;
const ALLOWED_CHANNELS = ['email', 'whatsapp'] as const;
const ALLOWED_STATUS = ['sent', 'failed', 'skipped', 'pending'] as const;
const ALLOWED_TEMPLATES = [
  'payment_received',
  'payment_received_admin',
  'due_reminder',
  'overdue_notice',
  'welcome',
  'password_reset',
] as const;

type SearchParams = {
  channel?: string;
  status?: string;
  template?: string;
  studentId?: string;
  debtId?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  offset?: string;
};

export default async function AdminNotificacionesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();

  const channel =
    searchParams.channel && (ALLOWED_CHANNELS as readonly string[]).includes(searchParams.channel)
      ? searchParams.channel
      : '';
  const status =
    searchParams.status && (ALLOWED_STATUS as readonly string[]).includes(searchParams.status)
      ? searchParams.status
      : '';
  const template =
    searchParams.template && (ALLOWED_TEMPLATES as readonly string[]).includes(searchParams.template)
      ? searchParams.template
      : '';
  const dateFrom = searchParams.dateFrom ?? '';
  const dateTo = searchParams.dateTo ?? '';
  const q = searchParams.q?.trim() ?? '';
  const offset = Math.max(parseInt(searchParams.offset ?? '0', 10) || 0, 0);

  const where: Record<string, unknown> = {};
  if (channel) where.channel = channel;
  if (status) where.status = status;
  if (template) where.template = template;
  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      createdAt.lte = d;
    }
    where.createdAt = createdAt;
  }
  if (q) where.recipient = { contains: q, mode: 'insensitive' };

  const [items, total] = await Promise.all([
    prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: offset,
      include: {
        debt: {
          select: {
            id: true,
            periodYear: true,
            periodMonth: true,
            status: true,
            student: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    }),
    prisma.notificationLog.count({ where }),
  ]);

  const hasFilters =
    Boolean(channel) ||
    Boolean(status) ||
    Boolean(template) ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    Boolean(q);

  const buildHref = (overrides: Partial<SearchParams>): string => {
    const params = new URLSearchParams();
    const merged: SearchParams = {
      channel: overrides.channel ?? channel,
      status: overrides.status ?? status,
      template: overrides.template ?? template,
      dateFrom: overrides.dateFrom ?? dateFrom,
      dateTo: overrides.dateTo ?? dateTo,
      q: overrides.q ?? q,
      offset: overrides.offset ?? '0',
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    return qs ? `/admin/notificaciones?${qs}` : '/admin/notificaciones';
  };

  return (
    <AdminShell>
      <header className="flex flex-col gap-3 border-b border-ink-900 pb-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">
            Notificaciones
          </div>
          <h1 className="font-display text-2xl text-ink-50">Bitácora de envíos</h1>
          <p className="mt-1 text-xs text-ink-500">
            Historial de emails y mensajes de WhatsApp enviados al dojo.
          </p>
        </div>
        <div className="text-xs text-ink-400">
          {total} resultado{total === 1 ? '' : 's'}
        </div>
      </header>

      {/* Filtros */}
      <form
        method="get"
        action="/admin/notificaciones"
        className="card-minimal p-4 mb-6 grid grid-cols-1 gap-3 md:grid-cols-6"
      >
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Canal
          </label>
          <select
            name="channel"
            defaultValue={channel}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todos</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Estado
          </label>
          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todos</option>
            <option value="sent">Enviado</option>
            <option value="failed">Fallido</option>
            <option value="skipped">Omitido</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Plantilla
          </label>
          <select
            name="template"
            defaultValue={template}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          >
            <option value="">Todas</option>
            <option value="payment_received">payment_received</option>
            <option value="payment_received_admin">payment_received_admin</option>
            <option value="due_reminder">due_reminder</option>
            <option value="overdue_notice">overdue_notice</option>
            <option value="welcome">welcome</option>
            <option value="password_reset">password_reset</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Desde
          </label>
          <input
            type="date"
            name="dateFrom"
            defaultValue={dateFrom}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Hasta
          </label>
          <input
            type="date"
            name="dateTo"
            defaultValue={dateTo}
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            Buscar destinatario
          </label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="email o teléfono"
            className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
          />
        </div>
        <div className="md:col-span-3 flex items-end gap-2">
          <button type="submit" className="btn-primary text-xs">
            <Filter className="h-4 w-4" />
            Aplicar filtros
          </button>
          {hasFilters && (
            <Link href="/admin/notificaciones" className="btn-secondary text-xs">
              Limpiar
            </Link>
          )}
        </div>
      </form>

      {/* Tabla */}
      {items.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-ink-500" />
          <p className="mt-3 text-sm text-ink-400">
            No hay notificaciones para los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Destinatario</th>
                <th className="px-4 py-3">Plantilla</th>
                <th className="hidden md:table-cell px-4 py-3">Alumno</th>
                <th className="hidden lg:table-cell px-4 py-3">Deuda</th>
                <th className="px-4 py-3">Estado</th>
                <th className="hidden lg:table-cell px-4 py-3">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {items.map((n) => {
                const date = n.createdAt.toLocaleString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const studentName = n.debt?.student
                  ? `${n.debt.student.firstName} ${n.debt.student.lastName}`.trim()
                  : null;
                return (
                  <tr key={n.id} className="hover:bg-ink-900/30">
                    <td className="px-4 py-3 text-xs text-ink-400 whitespace-nowrap">
                      {date}
                    </td>
                    <td className="px-4 py-3">
                      {n.channel === 'email' ? (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-shiroi-900/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-shiroi-300">
                          <Mail className="h-3 w-3" />
                          email
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-900/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300">
                          <MessageCircle className="h-3 w-3" />
                          whatsapp
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-200 text-xs truncate max-w-[180px]">
                      {n.recipient}
                    </td>
                    <td className="px-4 py-3 text-ink-300 text-xs">
                      {n.template}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-xs text-ink-300">
                      {studentName || '—'}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-xs text-ink-400">
                      {n.debt ? `${n.debt.periodMonth}/${n.debt.periodYear}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={n.status} />
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-xs text-shiroi-400 max-w-[200px] truncate">
                      {n.errorMessage || ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
          <div>
            Mostrando {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} de {total}
          </div>
          <div className="flex items-center gap-2">
            {offset > 0 && (
              <Link
                href={buildHref({ offset: String(Math.max(0, offset - PAGE_SIZE)) })}
                className="btn-secondary text-xs"
              >
                ← Anterior
              </Link>
            )}
            {offset + PAGE_SIZE < total && (
              <Link
                href={buildHref({ offset: String(offset + PAGE_SIZE) })}
                className="btn-secondary text-xs"
              >
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sent: 'bg-emerald-900/30 text-emerald-300',
    failed: 'bg-shiroi-900/30 text-shiroi-300',
    skipped: 'bg-ink-800 text-ink-400',
    pending: 'bg-amber-900/30 text-amber-300',
  };
  const cls = map[status] ?? 'bg-ink-800 text-ink-400';
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}
    >
      {status}
    </span>
  );
}