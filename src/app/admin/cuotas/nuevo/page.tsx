import { requireAdmin } from '@/lib/guards';
import AdminShell from '@/components/admin/AdminShell';
import FeeRuleForm from '@/components/admin/FeeRuleForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nueva regla de cuota', robots: { index: false, follow: false } };

export default async function NewFeeRulePage() {
  await requireAdmin();

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Cuotas</div>
        <h1 className="font-display text-2xl text-ink-50">Nueva regla de cuota</h1>
      </header>
      <FeeRuleForm />
    </AdminShell>
  );
}