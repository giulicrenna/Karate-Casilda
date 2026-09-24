import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import StudentReportsCharts from '@/components/admin/StudentReportsCharts';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pagos · Reportes', robots: { index: false, follow: false } };

export default async function AdminReportsPage() {
  await requireAdmin();

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [paymentsRaw, expensesRaw, incomesRaw, pendingAgg, totalCollectedAgg, debtsRaw, activeStudents] =
    await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'approved',
          paidAt: { gte: twelveMonthsAgo },
        },
        select: { amount: true, paidAt: true },
      }),
      prisma.expense.findMany({
        where: { occurredAt: { gte: twelveMonthsAgo } },
        select: { amount: true, occurredAt: true, category: true },
      }),
      prisma.income.findMany({
        where: { occurredAt: { gte: twelveMonthsAgo } },
        select: { amount: true, occurredAt: true, category: true },
      }),
      prisma.debt.aggregate({
        where: { status: { in: ['pending', 'partial', 'overdue'] } },
        _sum: { totalAmount: true, paidAmount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'approved' },
        _sum: { amount: true },
      }),
      prisma.debt.findMany({
        where: { status: { in: ['pending', 'partial', 'overdue'] } },
        include: { student: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.student.count({ where: { active: true } }),
    ]);

  // Cobrabilidad = total cobrado / (total cobrado + total pendiente)
  const totalRevenue = Number(totalCollectedAgg._sum.amount ?? 0);
  const totalCollectableAgg = await prisma.debt.aggregate({
    where: { status: { in: ['paid', 'partial', 'pending', 'overdue'] } },
    _sum: { totalAmount: true },
  });
  const totalCollectable = Number(totalCollectableAgg._sum.totalAmount ?? 0);
  const collectibility =
    totalCollectable > 0 ? Math.min(100, (totalRevenue / totalCollectable) * 100) : 100;

  const pendingTotal =
    Number(pendingAgg._sum.totalAmount ?? 0) - Number(pendingAgg._sum.paidAmount ?? 0);

  // Top deudores (top 10)
  const debtorMap = new Map<string, { name: string; debt: number }>();
  for (const d of debtsRaw) {
    const balance = Number(d.totalAmount) - Number(d.paidAmount);
    if (balance <= 0) continue;
    const cur = debtorMap.get(d.studentId);
    if (cur) {
      cur.debt += balance;
    } else {
      debtorMap.set(d.studentId, {
        name: `${d.student.firstName} ${d.student.lastName}`.trim(),
        debt: balance,
      });
    }
  }
  const topDebtors = Array.from(debtorMap.entries())
    .map(([studentId, v]) => ({ studentId, studentName: v.name, debt: v.debt }))
    .sort((a, b) => b.debt - a.debt)
    .slice(0, 10);

  // Mensual: revenues vs expenses para los últimos 12 meses.
  const paymentByKey = new Map<string, number>();
  for (const p of paymentsRaw as Array<{ amount: unknown; paidAt: Date | null }>) {
    if (!p.paidAt) continue;
    const key = `${p.paidAt.getFullYear()}-${p.paidAt.getMonth() + 1}`;
    paymentByKey.set(key, (paymentByKey.get(key) ?? 0) + Number(p.amount));
  }
  const expenseByKey = new Map<string, number>();
  for (const e of expensesRaw as Array<{ amount: unknown; occurredAt: Date }>) {
    const key = `${e.occurredAt.getFullYear()}-${e.occurredAt.getMonth() + 1}`;
    expenseByKey.set(key, (expenseByKey.get(key) ?? 0) + Number(e.amount));
  }
  const incomeByKey = new Map<string, number>();
  for (const i of incomesRaw as Array<{ amount: unknown; occurredAt: Date }>) {
    const key = `${i.occurredAt.getFullYear()}-${i.occurredAt.getMonth() + 1}`;
    incomeByKey.set(key, (incomeByKey.get(key) ?? 0) + Number(i.amount));
  }

  const monthly: {
    year: number;
    month: number;
    revenue: number;
    expenses: number;
    additionalIncome: number;
  }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthly.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      revenue: paymentByKey.get(key) ?? 0,
      expenses: expenseByKey.get(key) ?? 0,
      additionalIncome: incomeByKey.get(key) ?? 0,
    });
  }

  const totalExpenses = expensesRaw.reduce((s: number, e: { amount: unknown }) => s + Number(e.amount), 0);
  const totalIncome = incomesRaw.reduce((s: number, i: { amount: unknown }) => s + Number(i.amount), 0);

  // Categorías de gasto (todos los tiempos)
  const allExpenses = await prisma.expense.findMany({
    select: { category: true, amount: true },
  });
  const catMap = new Map<string, number>();
  for (const e of allExpenses) {
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount));
  }
  const categories = Array.from(catMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Pagos</div>
        <h1 className="font-display text-2xl text-ink-50">Reportes</h1>
        <p className="text-xs text-ink-400 mt-1">
          Visión general de ingresos, gastos y deuda pendiente. Los gráficos detallados se
          agregarán en una próxima fase.
        </p>
      </header>
      <StudentReportsCharts
        monthly={monthly}
        categories={categories}
        topDebtors={topDebtors}
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        totalIncome={totalIncome}
        pendingTotal={pendingTotal}
        collectibility={collectibility}
        activeStudents={activeStudents}
      />
    </AdminShell>
  );
}