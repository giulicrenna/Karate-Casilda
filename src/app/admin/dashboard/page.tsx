import Link from 'next/link';
import {
  Calendar,
  Images,
  Users,
  BarChart3,
  LogOut,
  FileText,
  Camera,
  AlertTriangle,
  Wallet,
  Banknote,
  TrendingUp,
  ClipboardList,
} from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import LogoutButton from '@/components/admin/LogoutButton';
import { googleDriveConfigured } from '@/services/google-drive';
import { formatARS } from '@/lib/money';
import { formatPeriod } from '@/lib/schedule';
import type { DebtStatus } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const session = await requireAdmin();

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    eventCount,
    albumCount,
    photoCount,
    upcomingEvents,
    recentAlbums,
    driveConfigured,
    activeStudents,
    totalStudents,
    overdueStudentsAgg,
    collectedThisMonthAgg,
    pendingAgg,
    topDebtorsRaw,
    recentPayments,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.album.count(),
    prisma.drivePhotoCache.count(),
    prisma.event.findMany({
      where: { status: 'upcoming' },
      orderBy: { date: 'asc' },
      take: 5,
    }),
    prisma.album.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    googleDriveConfigured(),
    prisma.student.count({ where: { active: true } }),
    prisma.student.count(),
    prisma.student.count({
      where: {
        active: true,
        debts: {
          some: { status: { in: ['overdue', 'pending', 'partial'] as DebtStatus[] } },
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'approved',
        paidAt: { gte: firstDayOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.debt.aggregate({
      where: { status: { in: ['pending', 'partial', 'overdue'] as DebtStatus[] } },
      _sum: { totalAmount: true, paidAmount: true },
    }),
    // Top 3 deudores — saldo pendiente (excluye pagadas/canceladas)
    prisma.debt.findMany({
      where: {
        status: { in: ['overdue', 'pending', 'partial'] as DebtStatus[] },
        student: { active: true },
      },
      select: {
        id: true,
        studentId: true,
        totalAmount: true,
        paidAmount: true,
        student: { select: { firstName: true, lastName: true } },
      },
      take: 50,
    }),
    prisma.payment.findMany({
      where: { status: 'approved' },
      orderBy: { paidAt: 'desc' },
      take: 5,
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  const collectedThisMonth = Number(collectedThisMonthAgg._sum.amount ?? 0);
  const totalPending = Math.max(
    0,
    Number(pendingAgg._sum.totalAmount ?? 0) - Number(pendingAgg._sum.paidAmount ?? 0),
  );

  // Agrupar saldo por alumno y ordenar top 3
  const balanceByStudent = new Map<
    string,
    { name: string; balance: number }
  >();
  for (const d of topDebtorsRaw) {
    const balance =
      Number(d.totalAmount.toString()) - Number(d.paidAmount.toString());
    if (balance <= 0) continue;
    const existing = balanceByStudent.get(d.studentId);
    if (existing) {
      existing.balance += balance;
    } else {
      balanceByStudent.set(d.studentId, {
        name: `${d.student.firstName} ${d.student.lastName}`.trim(),
        balance,
      });
    }
  }
  const topDebtors = Array.from(balanceByStudent.values())
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 3);

  return (
    <AdminShell>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Panel</div>
          <h1 className="font-display text-2xl text-ink-50">Dashboard</h1>
          <p className="mt-1 text-xs text-ink-500">
            Sesión iniciada como <strong>{session.email}</strong>
          </p>
        </div>
        <LogoutButton />
      </header>

      {/* KPIs institucionales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Alumnos activos"
          value={activeStudents}
          hint={`Total: ${totalStudents}`}
          href="/admin/alumnos"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Con deudas vencidas"
          value={overdueStudentsAgg}
          valueClass="text-shiroi-400"
          href="/admin/pagos"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Cobrado este mes"
          value={formatARS(collectedThisMonth)}
          hint={formatPeriod(now.getFullYear(), now.getMonth() + 1)}
          href="/admin/pagos/pagos"
        />
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          label="Pendiente total"
          value={formatARS(totalPending)}
          href="/admin/pagos"
        />
      </div>

      {/* KPIs del sitio institucional */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Eventos"
          value={eventCount}
          href="/admin/eventos"
        />
        <StatCard
          icon={<Images className="h-5 w-5" />}
          label="Álbumes"
          value={albumCount}
          href="/admin/albumes"
        />
        <StatCard
          icon={<Camera className="h-5 w-5" />}
          label="Fotos en caché"
          value={photoCount}
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Google Drive"
          value={driveConfigured ? 'OK' : 'No configurado'}
          valueClass={driveConfigured ? 'text-emerald-400' : 'text-shiroi-400'}
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top deudores */}
        <Panel title="Top deudores" href="/admin/pagos" linkLabel="Ver todas">
          {topDebtors.length === 0 ? (
            <Empty text="Sin deudas pendientes." />
          ) : (
            <ul className="divide-y divide-ink-900">
              {topDebtors.map((d, idx) => (
                <li key={`${d.name}-${idx}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-display text-sm text-ink-100 truncate">{d.name}</div>
                    <div className="text-xs text-ink-500">#{idx + 1} deudor</div>
                  </div>
                  <div className="font-display text-sm text-shiroi-400 whitespace-nowrap">
                    {formatARS(d.balance)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Últimos pagos */}
        <Panel title="Últimos pagos recibidos" href="/admin/pagos/pagos" linkLabel="Ver historial">
          {recentPayments.length === 0 ? (
            <Empty text="Sin pagos registrados." />
          ) : (
            <ul className="divide-y divide-ink-900">
              {recentPayments.map((p) => {
                const name = `${p.student.firstName} ${p.student.lastName}`.trim();
                const paidAt = p.paidAt
                  ? new Date(p.paidAt).toLocaleDateString('es-AR', { dateStyle: 'short' })
                  : '—';
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="font-display text-sm text-ink-100 truncate">{name}</div>
                      <div className="text-xs text-ink-500">
                        {paidAt} · {p.method}
                      </div>
                    </div>
                    <div className="font-display text-sm text-emerald-400 whitespace-nowrap">
                      {formatARS(Number(p.amount))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* Próximos eventos + recientes */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Próximos eventos" href="/admin/eventos" linkLabel="Ver todos">
          {upcomingEvents.length === 0 ? (
            <Empty text="No hay eventos próximos." />
          ) : (
            <ul className="divide-y divide-ink-900">
              {upcomingEvents.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-display text-sm text-ink-100 truncate">{ev.title}</div>
                    <div className="text-xs text-ink-500">
                      {new Date(ev.date).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · {ev.category}
                    </div>
                  </div>
                  <Link
                    href={`/admin/eventos/${ev.id}`}
                    className="text-xs text-shiroi-400 hover:text-shiroi-300 whitespace-nowrap"
                  >
                    Editar →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Álbumes recientes" href="/admin/albumes" linkLabel="Ver todos">
          {recentAlbums.length === 0 ? (
            <Empty text="Aún no hay álbumes." />
          ) : (
            <ul className="divide-y divide-ink-900">
              {recentAlbums.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-display text-sm text-ink-100 truncate">{a.title}</div>
                    <div className="text-xs text-ink-500">
                      {a.photoCount} fotos ·{' '}
                      {new Date(a.date).toLocaleDateString('es-AR', { dateStyle: 'short' })}
                    </div>
                  </div>
                  <Link
                    href={`/admin/albumes/${a.id}`}
                    className="text-xs text-shiroi-400 hover:text-shiroi-300 whitespace-nowrap"
                  >
                    Editar →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Acciones rápidas */}
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickAction
          href="/admin/eventos/nuevo"
          icon={<Calendar className="h-4 w-4" />}
          title="Crear evento"
          desc="Torneo, examen, seminario."
        />
        <QuickAction
          href="/admin/albumes/nuevo"
          icon={<Images className="h-4 w-4" />}
          title="Crear álbum"
          desc="Asociá una carpeta de Drive."
        />
        <QuickAction
          href="/admin/contenido"
          icon={<FileText className="h-4 w-4" />}
          title="Editar contenido"
          desc="Textos del sitio, contacto."
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickAction
          href="/admin/pagos/reportes"
          icon={<Banknote className="h-4 w-4" />}
          title="Reportes de pagos"
          desc="Revenue, gastos y cobrabilidad."
        />
        <QuickAction
          href="/admin/alumnos/nuevo"
          icon={<ClipboardList className="h-4 w-4" />}
          title="Nuevo alumno"
          desc="Cargar alumno y notificar credenciales."
        />
        <QuickAction
          href="/admin/cuotas/nuevo"
          icon={<Wallet className="h-4 w-4" />}
          title="Nueva regla de cuota"
          desc="Definir precio por días/sem."
        />
      </div>
    </AdminShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  hint,
  valueClass = 'text-ink-50',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href?: string;
  hint?: string;
  valueClass?: string;
}) {
  const content = (
    <div className="card-minimal p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">{label}</div>
        <div className="text-shiroi-600">{icon}</div>
      </div>
      <div className={`mt-3 font-display text-3xl ${valueClass}`}>{value}</div>
      {hint && <div className="mt-1 text-[11px] text-ink-500">{hint}</div>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function Panel({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-minimal p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-base text-ink-100">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-shiroi-400 hover:text-shiroi-300">
            {linkLabel} →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="py-6 text-center text-xs text-ink-500">{text}</div>;
}

function QuickAction({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="card-minimal p-5 flex items-center gap-3 hover:border-shiroi-700"
    >
      <div className="grid h-9 w-9 place-items-center rounded-sm bg-shiroi-900/30 text-shiroi-400">
        {icon}
      </div>
      <div>
        <div className="font-display text-sm text-ink-100">{title}</div>
        <div className="text-xs text-ink-500">{desc}</div>
      </div>
    </Link>
  );
}