import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import IncomeForm from '@/components/admin/IncomeForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar ingreso', robots: { index: false, follow: false } };

export default async function EditIncomePage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const income = await prisma.income.findUnique({ where: { id: params.id } });
  if (!income) notFound();

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Pagos</div>
        <h1 className="font-display text-2xl text-ink-50">Editar ingreso</h1>
      </header>
      <IncomeForm
        initial={{
          id: income.id,
          category: income.category,
          description: income.description,
          amount: Number(income.amount),
          occurredAt: income.occurredAt.toISOString(),
          source: income.source,
          method: income.method,
          receiptDriveFileId: income.receiptDriveFileId,
          notes: income.notes,
        }}
      />
    </AdminShell>
  );
}
