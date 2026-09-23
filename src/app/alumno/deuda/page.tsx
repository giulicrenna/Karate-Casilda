import { requireStudent } from '@/lib/guards';
import { prisma } from '@/lib/db';
import DebtCard from '@/components/alumno/DebtCard';
import PayButton from '@/components/alumno/PayButton';
import { getMercadoPagoCredentials } from '@/lib/credentials/mercadopago';
import type { DebtStatus } from '@/types';
import { formatARS } from '@/lib/money';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mi deuda', robots: { index: false, follow: false } };

export default async function StudentDebtPage() {
  const session = await requireStudent({ allowMustChange: true });

  // ¿Mercado Pago está configurado? Pasamos la info al cliente.
  const mpConfigured = (await getMercadoPagoCredentials()) !== null;

  const debts = await prisma.debt.findMany({
    where: { studentId: session.studentId },
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
  });

  const serialized = debts.map((d) => ({
    id: d.id,
    periodYear: d.periodYear,
    periodMonth: d.periodMonth,
    baseAmount: Number(d.baseAmount),
    surchargeAmount: Number(d.surchargeAmount),
    manualAdjustment: Number(d.manualAdjustment),
    totalAmount: Number(d.totalAmount),
    paidAmount: Number(d.paidAmount),
    balance: Number(d.totalAmount) - Number(d.paidAmount),
    dueDate: d.dueDate.toISOString(),
    status: d.status as DebtStatus,
    manualNote: d.manualNote,
  }));

  // Deudas que se pueden pagar en línea: pending | partial | overdue.
  const payableIds = serialized
    .filter((d) => d.status === 'pending' || d.status === 'partial' || d.status === 'overdue')
    .map((d) => d.id);

  const totalPending = serialized
    .filter((d) => d.status !== 'paid' && d.status !== 'cancelled')
    .reduce((s, d) => s + d.balance, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header>
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Portal alumno</div>
        <h1 className="font-display text-2xl text-ink-50">Mi deuda</h1>
        <p className="mt-1 text-sm text-ink-400">
          Estado de tus cuotas mensuales. El saldo total pendiente es{' '}
          <span className="text-shiroi-300 font-medium">{formatARS(totalPending)}</span>.
        </p>
      </header>

      {payableIds.length > 0 && (
        <div className="card-minimal p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-shiroi-500">
              Pagá en línea
            </div>
            <p className="mt-1 text-sm text-ink-400">
              Tenés {payableIds.length} cuota{payableIds.length === 1 ? '' : 's'} para
              regularizar.
            </p>
          </div>
          <PayButton debtIds={payableIds} configured={mpConfigured} />
        </div>
      )}

      {serialized.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">No tenés deudas registradas todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {serialized.map((d) => (
            <DebtCard key={d.id} debt={d} />
          ))}
        </div>
      )}
    </div>
  );
}
