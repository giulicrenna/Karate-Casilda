import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import ExpenseTable from '@/components/admin/ExpenseTable';
import ExpenseRowActions from '@/components/admin/ExpenseRowActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pagos · Gastos', robots: { index: false, follow: false } };

export default async function AdminExpensesPage() {
  await requireAdmin();
  const expensesRaw = await prisma.expense.findMany({
    orderBy: { occurredAt: 'desc' },
    take: 200,
  });

  const expenses = expensesRaw.map((e) => ({
    id: e.id,
    category: e.category,
    description: e.description,
    amount: Number(e.amount),
    occurredAt: e.occurredAt.toISOString(),
    vendor: e.vendor,
    notes: e.notes,
  }));

  return (
    <AdminShell>
      <header className="flex items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Pagos</div>
          <h1 className="font-display text-2xl text-ink-50">Gastos del dojo</h1>
        </div>
        <Link href="/admin/pagos/gastos/nuevo" className="btn-primary text-xs">
          <Plus className="h-4 w-4" />
          Nuevo gasto
        </Link>
      </header>

      <ExpenseTable
        expenses={expenses}
        actions={(id, description) => <ExpenseRowActions id={id} description={description} />}
      />
    </AdminShell>
  );
}