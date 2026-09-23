import { formatARS } from '@/lib/money';
import { formatPeriod } from '@/lib/schedule';
import { formatDate } from '@/lib/utils';
import type { DebtStatus } from '@/types';

interface DebtCardData {
  id: string;
  periodYear: number;
  periodMonth: number;
  baseAmount: number;
  surchargeAmount: number;
  manualAdjustment: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: DebtStatus;
  manualNote: string | null;
}

const STATUS_LABEL: Record<DebtStatus, string> = {
  pending: 'Pendiente',
  partial: 'Pago parcial',
  paid: 'Pagada',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
};

function statusClasses(status: DebtStatus): string {
  switch (status) {
    case 'paid':
      return 'border-emerald-700 bg-emerald-950/20';
    case 'partial':
      return 'border-amber-700 bg-amber-950/20';
    case 'overdue':
      return 'border-shiroi-700 bg-shiroi-950/20';
    case 'cancelled':
      return 'border-ink-700 bg-ink-900 opacity-60';
    case 'pending':
    default:
      return 'border-ink-700 bg-ink-950';
  }
}

function statusBadge(status: DebtStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-emerald-900/40 text-emerald-300';
    case 'partial':
      return 'bg-amber-900/40 text-amber-300';
    case 'overdue':
      return 'bg-shiroi-900/40 text-shiroi-300';
    case 'cancelled':
      return 'bg-ink-800 text-ink-500 line-through';
    case 'pending':
    default:
      return 'bg-ink-800 text-ink-300';
  }
}

export default function DebtCard({ debt }: { debt: DebtCardData }) {
  return (
    <div className={`rounded-md border p-5 ${statusClasses(debt.status)}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-500">Período</div>
          <div className="font-display text-lg text-ink-100">
            {formatPeriod(debt.periodYear, debt.periodMonth)}
          </div>
        </div>
        <span
          className={
            'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
            statusBadge(debt.status)
          }
        >
          {STATUS_LABEL[debt.status]}
        </span>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Cuota base" value={formatARS(debt.baseAmount)} />
        {debt.surchargeAmount > 0 && (
          <Row label="Recargo por mora" value={formatARS(debt.surchargeAmount)} highlight />
        )}
        {debt.manualAdjustment !== 0 && (
          <Row
            label="Ajuste manual"
            value={formatARS(debt.manualAdjustment)}
            subtext={debt.manualNote ?? undefined}
            highlight
          />
        )}
        <Row label="Total" value={formatARS(debt.totalAmount)} bold />
        <Row label="Pagado" value={formatARS(debt.paidAmount)} />
        <Row
          label="Saldo"
          value={formatARS(debt.balance)}
          bold
          tone={debt.balance > 0 ? 'warning' : 'positive'}
        />
        <Row label="Vencimiento" value={formatDate(new Date(debt.dueDate))} />
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
  subtext,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  subtext?: string;
  tone?: 'positive' | 'warning';
}) {
  const valueClass = bold
    ? tone === 'positive'
      ? 'text-emerald-300'
      : tone === 'warning'
      ? 'text-shiroi-300'
      : 'text-ink-100'
    : highlight
    ? 'text-shiroi-400'
    : 'text-ink-200';
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs uppercase tracking-wider text-ink-500">{label}</dt>
      <dd className={`text-right ${valueClass}`}>
        {value}
        {subtext && (
          <div className="mt-0.5 text-[10px] italic text-ink-500">{subtext}</div>
        )}
      </dd>
    </div>
  );
}