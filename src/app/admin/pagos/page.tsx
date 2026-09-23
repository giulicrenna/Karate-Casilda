import Link from 'next/link';
import { Banknote, ListChecks, BarChart3 } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import DebtTable from '@/components/admin/DebtTable';
import GenerateMonthlyDebtButton from '@/components/admin/GenerateMonthlyDebtButton';
import RunCronButtons from '@/components/admin/RunCronButtons';
import { formatARS } from '@/lib/money';
import { previousMonth } from '@/lib/schedule';
import type { DebtStatus } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pagos · Deudas', robots: { index: false, follow: false } };

export default async function AdminPagosPage() {
  await requireAdmin();

  const prev = previousMonth();
  const [debtsRaw, totalPendingAgg, collectedThisMonthAgg, paidStudentsCount] = await Promise.all([
    prisma.debt.findMany({
      include: {
        student: { select: { id: true, firstName: true, lastName: true, active: true } },
      },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
      take: 200,
    }),
    prisma.debt.aggregate({
      where: {
        status: { in: ['pending', 'partial', 'overdue'] },
      },
      _sum: { totalAmount: true, paidAmount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'approved',
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
    prisma.student.count({
      where: {
        active: true,
        OR: [
          { debts: { every: { status: { in: ['paid', 'cancelled'] } } } },
          { debts: { none: {} } },
        ],
      },
    }),
  ]);

  const debts = debtsRaw.map((d) => ({
    id: d.id,
    studentId: d.studentId,
    studentName: `${d.student.firstName} ${d.student.lastName}`.trim(),
    periodYear: d.periodYear,
    periodMonth: d.periodMonth,
    baseAmount: Number(d.baseAmount),
    surchargeAmount: Number(d.surchargeAmount),
    manualAdjustment: Number(d.manualAdjustment),
    totalAmount: Number(d.totalAmount),
    paidAmount: Number(d.paidAmount),
    balance: Number(d.totalAmount) - Number(d.paidAmount),
    dueDate: d.dueDate.toISOString(),
    status: d.status as DebtStatus,
    manualNote: d.manualNote,
  }));

  const totalPending =
    Number(totalPendingAgg._sum.totalAmount ?? 0) - Number(totalPendingAgg._sum.paidAmount ?? 0);
  const collectedThisMonth = Number(collectedThisMonthAgg._sum.amount ?? 0);
  const totalStudents = await prisma.student.count({ where: { active: true } });

  return (
    <AdminShell>
      <header className="flex flex-col gap-3 border-b border-ink-900 pb-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Pagos</div>
          <h1 className="font-display text-2xl text-ink-50">Deudas</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/pagos/pagos" className="btn-secondary text-xs">
            <ListChecks className="h-4 w-4" />
            Historial de pagos
          </Link>
          <Link href="/admin/pagos/gastos" className="btn-secondary text-xs">
            <Banknote className="h-4 w-4" />
            Gastos
          </Link>
          <Link href="/admin/pagos/reportes" className="btn-secondary text-xs">
            <BarChart3 className="h-4 w-4" />
            Reportes
          </Link>
          <GenerateMonthlyDebtButton defaultYear={prev.year} defaultMonth={prev.month} />
          <RunCronButtons />
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
        <KpiCard
          label="Pendiente total"
          value={formatARS(totalPending)}
          hint="Suma de saldos pendientes de todas las deudas activas"
        />
        <KpiCard
          label="Cobrado este mes"
          value={formatARS(collectedThisMonth)}
          hint="Pagos aprobados durante el mes en curso"
        />
        <KpiCard
          label="Alumnos al día"
          value={`${paidStudentsCount} / ${totalStudents}`}
          hint="Alumnos activos sin deudas vencidas o impagas"
        />
      </section>

      <DebtTable debts={debts} />
    </AdminShell>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="card-minimal p-5">
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-2 font-display text-2xl text-ink-50">{value}</div>
      <div className="mt-1 text-xs text-ink-500">{hint}</div>
    </div>
  );
}