import Link from 'next/link';
import { Plus, Receipt, Percent } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import FeeRuleRowActions from '@/components/admin/FeeRuleRowActions';
import SurchargeRowActions from '@/components/admin/SurchargeRowActions';
import { formatARS } from '@/lib/money';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cuotas', robots: { index: false, follow: false } };

export default async function AdminCuotasPage() {
  await requireAdmin();
  const [feeRules, surchargeRules] = await Promise.all([
    prisma.feeRule.findMany({
      orderBy: [{ active: 'desc' }, { daysPerWeek: 'asc' }, { effectiveFrom: 'desc' }],
    }),
    prisma.lateSurchargeRule.findMany({
      orderBy: [{ active: 'desc' }, { effectiveFrom: 'desc' }],
    }),
  ]);

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Cuotas</div>
        <h1 className="font-display text-2xl text-ink-50">Reglas de cuota y mora</h1>
      </header>

      {/* Reglas de cuota */}
      <section className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg text-ink-100 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-shiroi-500" />
            Reglas de cuota
          </h2>
          <Link href="/admin/cuotas/nuevo" className="btn-primary text-xs">
            <Plus className="h-4 w-4" />
            Nueva regla
          </Link>
        </div>

        {feeRules.length === 0 ? (
          <div className="card-minimal p-8 text-center">
            <p className="text-sm text-ink-400">No hay reglas de cuota todavía.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-ink-800">
            <table className="w-full text-sm">
              <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Días/sem</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="hidden md:table-cell px-4 py-3">Vigente</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900">
                {feeRules.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-900/30">
                    <td className="px-4 py-3 text-ink-100">{r.name}</td>
                    <td className="px-4 py-3 text-ink-300">{r.daysPerWeek}</td>
                    <td className="px-4 py-3 text-ink-200">
                      {formatARS(Number(r.monthlyAmount))}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-xs text-ink-400">
                      {formatDate(r.effectiveFrom)}
                      {r.effectiveUntil ? ` → ${formatDate(r.effectiveUntil)}` : ' → ∞'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
                          (r.active
                            ? 'bg-emerald-900/30 text-emerald-300'
                            : 'bg-ink-800 text-ink-500')
                        }
                      >
                        {r.active ? 'activa' : 'inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <FeeRuleRowActions id={r.id} active={r.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reglas de recargo por mora */}
      <section>
        <h2 className="font-display text-lg text-ink-100 flex items-center gap-2 mb-4">
          <Percent className="h-4 w-4 text-shiroi-500" />
          Reglas de recargo por mora
        </h2>

        {surchargeRules.length === 0 ? (
          <div className="card-minimal p-8 text-center">
            <p className="text-sm text-ink-400">No hay reglas de recargo todavía.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-ink-800">
            <table className="w-full text-sm">
              <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Día de gracia</th>
                  <th className="px-4 py-3">Recargo</th>
                  <th className="hidden md:table-cell px-4 py-3">Vigente</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900">
                {surchargeRules.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-900/30">
                    <td className="px-4 py-3 text-ink-100">{r.name}</td>
                    <td className="px-4 py-3 text-ink-300">
                      Día {r.graceDays} (aplica desde día {r.graceDays + 1})
                    </td>
                    <td className="px-4 py-3 text-ink-200">{Number(r.surchargePct)}%</td>
                    <td className="hidden md:table-cell px-4 py-3 text-xs text-ink-400">
                      {formatDate(r.effectiveFrom)}
                      {r.effectiveUntil ? ` → ${formatDate(r.effectiveUntil)}` : ' → ∞'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
                          (r.active
                            ? 'bg-emerald-900/30 text-emerald-300'
                            : 'bg-ink-800 text-ink-500')
                        }
                      >
                        {r.active ? 'activa' : 'inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <SurchargeRowActions id={r.id} active={r.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}