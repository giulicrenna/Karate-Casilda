import { requireAdmin } from '@/lib/guards';
import AdminShell from '@/components/admin/AdminShell';
import IncomeForm from '@/components/admin/IncomeForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nuevo ingreso', robots: { index: false, follow: false } };

export default async function NewIncomePage() {
  await requireAdmin();
  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Pagos</div>
        <h1 className="font-display text-2xl text-ink-50">Nuevo ingreso</h1>
      </header>
      <IncomeForm />
    </AdminShell>
  );
}
