import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import IncomeTable from '@/components/admin/IncomeTable';
import IncomeRowActions from '@/components/admin/IncomeRowActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pagos · Ingresos', robots: { index: false, follow: false } };

export default async function AdminIncomesPage() {
  await requireAdmin();
  const incomesRaw = await prisma.income.findMany({
    orderBy: { occurredAt: 'desc' },
    take: 200,
  });

  const incomes = incomesRaw.map((e) => ({
    id: e.id,
    category: e.category,
    description: e.description,
    amount: Number(e.amount),
    occurredAt: e.occurredAt.toISOString(),
    source: e.source,
    method: e.method,
    notes: e.notes,
  }));

  return (
    <AdminShell>
      <header className="flex items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Pagos</div>
          <h1 className="font-display text-2xl text-ink-50">Ingresos adicionales</h1>
        </div>
        <Link href="/admin/pagos/ingresos/nuevo" className="btn-primary text-xs">
          <Plus className="h-4 w-4" />
          Nuevo ingreso
        </Link>
      </header>

      <IncomeTable
        incomes={incomes}
        actions={(id, description) => <IncomeRowActions id={id} description={description} />}
      />
    </AdminShell>
  );
}
