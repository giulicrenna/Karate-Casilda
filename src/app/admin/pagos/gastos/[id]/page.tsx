import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import ExpenseForm from '@/components/admin/ExpenseForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar gasto', robots: { index: false, follow: false } };

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const expense = await prisma.expense.findUnique({ where: { id: params.id } });
  if (!expense) notFound();

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Pagos</div>
        <h1 className="font-display text-2xl text-ink-50">Editar gasto</h1>
      </header>
      <ExpenseForm
        initial={{
          id: expense.id,
          category: expense.category,
          description: expense.description,
          amount: Number(expense.amount),
          occurredAt: expense.occurredAt.toISOString(),
          vendor: expense.vendor,
          receiptDriveFileId: expense.receiptDriveFileId,
          notes: expense.notes,
        }}
      />
    </AdminShell>
  );
}