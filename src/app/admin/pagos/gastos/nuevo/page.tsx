import { requireAdmin } from '@/lib/guards';
import AdminShell from '@/components/admin/AdminShell';
import ExpenseForm from '@/components/admin/ExpenseForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nuevo gasto', robots: { index: false, follow: false } };

export default async function NewExpensePage() {
  await requireAdmin();
  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Pagos</div>
        <h1 className="font-display text-2xl text-ink-50">Nuevo gasto</h1>
      </header>
      <ExpenseForm />
    </AdminShell>
  );
}