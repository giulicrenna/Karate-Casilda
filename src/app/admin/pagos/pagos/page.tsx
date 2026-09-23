import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import PaymentTable from '@/components/admin/PaymentTable';
import type { PaymentMethod, PaymentStatus } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pagos · Historial', robots: { index: false, follow: false } };

export default async function AdminPaymentsHistoryPage() {
  await requireAdmin();

  const paymentsRaw = await prisma.payment.findMany({
    include: {
      student: { select: { firstName: true, lastName: true } },
      debt: { select: { id: true, periodYear: true, periodMonth: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const payments = paymentsRaw.map((p) => ({
    id: p.id,
    studentName: `${p.student.firstName} ${p.student.lastName}`.trim(),
    debtId: p.debtId,
    debtPeriod: p.debt
      ? `${p.debt.periodYear}-${String(p.debt.periodMonth).padStart(2, '0')}`
      : null,
    amount: Number(p.amount),
    currency: p.currency,
    method: p.method as PaymentMethod,
    status: p.status as PaymentStatus,
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Pagos</div>
        <h1 className="font-display text-2xl text-ink-50">Historial de pagos</h1>
      </header>
      <PaymentTable payments={payments} />
    </AdminShell>
  );
}