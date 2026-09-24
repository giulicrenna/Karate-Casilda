'use client';

import { formatARS } from '@/lib/money';
import { formatPeriod } from '@/lib/schedule';

interface MonthlyRevenuePoint {
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  additionalIncome: number;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
}

interface TopDebtor {
  studentId: string;
  studentName: string;
  debt: number;
}

interface Props {
  monthly: MonthlyRevenuePoint[];
  categories: CategoryBreakdown[];
  topDebtors: TopDebtor[];
  totalRevenue: number;
  totalExpenses: number;
  totalIncome: number;
  pendingTotal: number;
  collectibility: number; // 0..100
  activeStudents: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  alquiler: 'Alquiler',
  sueldos: 'Sueldos',
  servicios: 'Servicios',
  insumos: 'Insumos',
  mantenimiento: 'Mantenimiento',
  impuestos: 'Impuestos',
  otro: 'Otro',
};

export default function StudentReportsCharts({
  monthly,
  categories,
  topDebtors,
  totalRevenue,
  totalExpenses,
  totalIncome,
  pendingTotal,
  collectibility,
  activeStudents,
}: Props) {
  const balance = totalRevenue - totalExpenses;
  const maxMonthly = Math.max(
    1,
    ...monthly.map((m) => Math.max(m.revenue, m.expenses, m.additionalIncome)),
  );

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile label="Ingresos (cobrado)" value={formatARS(totalRevenue)} tone="positive" />
        <KpiTile label="Gastos" value={formatARS(totalExpenses)} tone="negative" />
        <KpiTile
          label="Balance"
          value={formatARS(balance)}
          tone={balance >= 0 ? 'positive' : 'negative'}
        />
        <KpiTile label="Pendiente" value={formatARS(pendingTotal)} tone="warning" />
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiTile label="Cobrabilidad" value={`${collectibility.toFixed(1)}%`} tone="info" />
        <KpiTile label="Alumnos activos" value={String(activeStudents)} tone="info" />
        <KpiTile
          label="Períodos analizados"
          value={String(monthly.length)}
          tone="info"
        />
      </section>

      <section className="card-minimal p-5">
        <h2 className="font-display text-lg text-ink-100 mb-4">Ingresos vs Gastos por mes</h2>
        {monthly.length === 0 ? (
          <p className="text-sm text-ink-500">Sin datos suficientes.</p>
        ) : (
          <div className="space-y-3">
            {monthly.map((m) => (
              <div key={`${m.year}-${m.month}`} className="flex items-center gap-3">
                <div className="w-28 shrink-0 text-xs text-ink-300">
                  {formatPeriod(m.year, m.month)}
                </div>
                <div className="flex-1 space-y-1">
                  <Bar
                    label="Ingresos"
                    value={m.revenue}
                    max={maxMonthly}
                    colorClass="bg-emerald-500/80"
                  />
                  <Bar
                    label="Ingresos adicionales"
                    value={m.additionalIncome}
                    max={maxMonthly}
                    colorClass="bg-amber-500/80"
                  />
                  <Bar
                    label="Gastos"
                    value={m.expenses}
                    max={maxMonthly}
                    colorClass="bg-shiroi-700"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiTile
          label="Ingresos adicionales"
          value={formatARS(totalIncome)}
          tone="info"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-minimal p-5">
          <h2 className="font-display text-lg text-ink-100 mb-4">Top deudores</h2>
          {topDebtors.length === 0 ? (
            <p className="text-sm text-ink-500">Sin deudas pendientes.</p>
          ) : (
            <ol className="space-y-2">
              {topDebtors.map((d, i) => (
                <li
                  key={d.studentId}
                  className="flex items-center justify-between gap-3 border-b border-ink-900 pb-2 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-sm bg-ink-900 text-[10px] text-ink-400">
                      {i + 1}
                    </span>
                    <span className="text-sm text-ink-100">{d.studentName}</span>
                  </div>
                  <span className="text-sm font-medium text-shiroi-400">
                    {formatARS(d.debt)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="card-minimal p-5">
          <h2 className="font-display text-lg text-ink-100 mb-4">Gastos por categoría</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-ink-500">Sin gastos registrados.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((c) => (
                <li
                  key={c.category}
                  className="flex items-center justify-between gap-3 border-b border-ink-900 pb-2 last:border-b-0"
                >
                  <span className="text-sm text-ink-200">
                    {CATEGORY_LABEL[c.category] ?? c.category}
                  </span>
                  <span className="text-sm font-medium text-ink-100">
                    {formatARS(c.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function KpiTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'positive' | 'negative' | 'warning' | 'info';
}) {
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-300'
      : tone === 'negative'
      ? 'text-shiroi-400'
      : tone === 'warning'
      ? 'text-amber-300'
      : 'text-ink-100';
  return (
    <div className="card-minimal p-4">
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className={`mt-1 font-display text-xl ${toneClass}`}>{value}</div>
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  colorClass,
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[10px] uppercase tracking-wider text-ink-500">{label}</span>
      <div className="relative flex-1 h-3 overflow-hidden rounded-sm bg-ink-900">
        <div
          className={`h-full ${colorClass}`}
          style={{ width: `${pct}%` }}
          aria-label={`${label}: ${value}`}
        />
      </div>
      <span className="w-20 text-right text-[11px] text-ink-300">
        {formatARS(value)}
      </span>
    </div>
  );
}