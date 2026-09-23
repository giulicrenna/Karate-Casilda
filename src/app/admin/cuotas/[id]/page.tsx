import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import FeeRuleForm from '@/components/admin/FeeRuleForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar regla de cuota', robots: { index: false, follow: false } };

export default async function EditFeeRulePage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const rule = await prisma.feeRule.findUnique({ where: { id: params.id } });
  if (!rule) notFound();

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Cuotas</div>
        <h1 className="font-display text-2xl text-ink-50">Editar regla de cuota</h1>
      </header>
      <FeeRuleForm
        initial={{
          id: rule.id,
          name: rule.name,
          daysPerWeek: rule.daysPerWeek,
          monthlyAmount: Number(rule.monthlyAmount),
          effectiveFrom: rule.effectiveFrom.toISOString(),
          effectiveUntil: rule.effectiveUntil ? rule.effectiveUntil.toISOString() : null,
          active: rule.active,
        }}
      />
    </AdminShell>
  );
}