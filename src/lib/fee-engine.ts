// Fee engine — funciones puras sin Prisma. Testeables mentalmente.
//
// Convenciones:
// - `monthlyAmount` y `manualAdjustment` están en ARS (número JS con coma decimal).
// - `effectiveFrom`/`effectiveUntil` son rangos de vigencia: la regla es válida si
//   `asOfDate >= effectiveFrom` y (`effectiveUntil` es null o `asOfDate <= effectiveUntil`).
// - Para FeeRule: se prefiere la regla con `effectiveFrom` más reciente si hay varias
//   vigentes para el mismo `daysPerWeek` (escenario típico: cambio de precio).
// - Para LateSurchargeRule: si hay varias activas, se elige la de mayor graceDays
//   más cercana a la fecha (escenario típico: superposición transitoria).

import type { DebtStatus } from '@/types';
import { isPastDue, nextMonth } from '@/lib/schedule';

export interface FeeRuleInput {
  id?: string;
  daysPerWeek: number;
  monthlyAmount: number;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  active: boolean;
}

export interface LateSurchargeRuleInput {
  id?: string;
  graceDays: number;
  surchargePct: number;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  active: boolean;
}

export interface DebtComputation {
  baseAmount: number;
  surchargeAmount: number;
  manualAdjustment: number;
  totalAmount: number;
  dueDate: Date;
  status: DebtStatus;
}

function isInRange(d: Date, from: Date, until: Date | null): boolean {
  const t = d.getTime();
  if (t < from.getTime()) return false;
  if (until && t > until.getTime()) return false;
  return true;
}

/** Resuelve el FeeRule aplicable para los días contractuales del alumno en una fecha. */
export function resolveFeeRule(
  rules: FeeRuleInput[],
  attendanceDaysPerWeek: number,
  asOfDate: Date,
): FeeRuleInput | null {
  const candidates = rules.filter(
    (r) =>
      r.active &&
      r.daysPerWeek === attendanceDaysPerWeek &&
      isInRange(asOfDate, r.effectiveFrom, r.effectiveUntil),
  );
  if (candidates.length === 0) return null;
  // Más reciente primero (último effectiveFrom gana)
  candidates.sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());
  return candidates[0];
}

/** Resuelve el LateSurchargeRule activo en una fecha (uno solo). */
export function resolveSurchargeRule(
  rules: LateSurchargeRuleInput[],
  asOfDate: Date,
): LateSurchargeRuleInput | null {
  const candidates = rules.filter(
    (r) => r.active && isInRange(asOfDate, r.effectiveFrom, r.effectiveUntil),
  );
  if (candidates.length === 0) return null;
  // Si hay varias, prioriza la de mayor surchargePct (la más estricta).
  candidates.sort((a, b) => b.surchargePct - a.surchargePct);
  return candidates[0];
}

/**
 * dueDate por defecto: día 10 del mes siguiente al período.
 * Para período Marzo 2026 → dueDate = 10 de Abril de 2026 (00:00 hora local).
 */
export function getDefaultDueDate(periodYear: number, periodMonth: number): Date {
  const next = nextMonth(new Date(periodYear, periodMonth - 1, 1));
  return new Date(next.year, next.month - 1, 10, 0, 0, 0, 0);
}

/** Recalcula status dado totalAmount, paidAmount, dueDate y today. */
export function recomputeDebtStatus(
  totalAmount: number,
  paidAmount: number,
  dueDate: Date,
  today: Date = new Date(),
): DebtStatus {
  if (totalAmount <= 0) return 'pending';
  if (paidAmount >= totalAmount) return 'paid';
  if (paidAmount > 0 && paidAmount < totalAmount) {
    return isPastDue(dueDate, today) ? 'overdue' : 'partial';
  }
  // paidAmount === 0
  return isPastDue(dueDate, today) ? 'overdue' : 'pending';
}

/**
 * Calcula la deuda para un alumno en un período.
 * Retorna null si no hay FeeRule aplicable para los días contractuales del alumno.
 */
export function computeDebt(
  student: {
    id: string;
    joinedAt: Date;
    profile: { attendanceDaysPerWeek: number } | null;
  },
  periodYear: number,
  periodMonth: number,
  feeRules: FeeRuleInput[],
  surchargeRules: LateSurchargeRuleInput[],
  manualAdjustment: number = 0,
  paidAmount: number = 0,
  today: Date = new Date(),
  dueDate?: Date,
): DebtComputation | null {
  const daysPerWeek = student.profile?.attendanceDaysPerWeek ?? 0;
  if (daysPerWeek <= 0) return null;

  // El período es el mes de la cuota. La regla debe estar vigente durante el período
  // (no en el día actual): usar el primer día del período como asOfDate.
  const periodStart = new Date(periodYear, periodMonth - 1, 1);
  const fee = resolveFeeRule(feeRules, daysPerWeek, periodStart);
  if (!fee) return null;

  // Si joinedAt es posterior al final del período, no hay cuota para ese mes.
  const periodEnd = new Date(periodYear, periodMonth, 0, 23, 59, 59, 999);
  if (student.joinedAt.getTime() > periodEnd.getTime()) return null;

  const baseAmount = round2(fee.monthlyAmount);

  // Recargo: solo aplica si hoy > graceDays y paidAmount < totalAmount.
  // surchargeRules y today determinan si la mora ya rige al momento de generar.
  const finalDueDate = dueDate ?? getDefaultDueDate(periodYear, periodMonth);
  let surchargeAmount = 0;
  const projectedTotal = baseAmount + manualAdjustment;
  if (paidAmount < projectedTotal) {
    const surcharge = resolveSurchargeRule(surchargeRules, today);
    if (surcharge) {
      const todayDay = today.getDate();
      if (todayDay > surcharge.graceDays) {
        // Mora calculada sobre (base + manual). Excluye la propia mora.
        surchargeAmount = round2((projectedTotal * surcharge.surchargePct) / 100);
      }
    }
  }

  const totalAmount = round2(baseAmount + surchargeAmount + manualAdjustment);
  const status = recomputeDebtStatus(totalAmount, paidAmount, finalDueDate, today);

  return {
    baseAmount,
    surchargeAmount,
    manualAdjustment: round2(manualAdjustment),
    totalAmount,
    dueDate: finalDueDate,
    status,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}