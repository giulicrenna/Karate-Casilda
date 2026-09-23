// Bridge entre `src/lib/fee-engine.ts` (funciones puras) y Prisma.
//
// Este módulo orquesta:
// - leer FeeRule / LateSurchargeRule / Student / Profile desde la DB
// - llamar a las funciones puras para calcular la deuda
// - persistir Debt con upsert (idempotente) usando el constraint @@unique
// - recomputar paidAmount y status al registrar pagos manuales / cambios
//
// Los handlers HTTP consumen estas funciones; el fee engine puro es 100% testeable.

import 'server-only';
import { prisma } from '@/lib/db';
import {
  computeDebt,
  getDefaultDueDate,
  recomputeDebtStatus,
  resolveFeeRule,
  resolveSurchargeRule,
  type FeeRuleInput,
  type LateSurchargeRuleInput,
} from '@/lib/fee-engine';
import type { DebtStatus } from '@/types';
import { previousMonth } from '@/lib/schedule';

// Tipos locales mínimos (no dependemos de Prisma.Client para mantener este
// módulo portable y testeable aunque la generación de tipos aún no haya corrido).
interface FeeRuleRow {
  id: string;
  daysPerWeek: number;
  monthlyAmount: { toString(): string } | number | null;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  active: boolean;
}
interface SurchargeRuleRow {
  id: string;
  graceDays: number;
  surchargePct: { toString(): string } | number | null;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  active: boolean;
}
interface DebtRow {
  id: string;
  studentId: string;
  periodYear: number;
  periodMonth: number;
  baseAmount: { toString(): string } | number | null;
  surchargeAmount: { toString(): string } | number | null;
  manualAdjustment: { toString(): string } | number | null;
  totalAmount: { toString(): string } | number | null;
  paidAmount: { toString(): string } | number | null;
  dueDate: Date;
  status: string;
  manualNote: string | null;
  generatedAt: Date;
}
interface PaymentRow {
  id: string;
  amount: { toString(): string } | number | null;
  debtId: string | null;
  status: string;
}

function toNumber(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v);
  if (typeof v === 'object' && v && 'toString' in v) return parseFloat(String(v));
  return 0;
}

interface GenerateOptions {
  manualAdjustment?: number;
  manualNote?: string;
  dueDate?: Date;
}

/**
 * Genera o actualiza la deuda de un alumno para un período.
 * Idempotente gracias a `@@unique([studentId, periodYear, periodMonth])`.
 */
export async function generateOrUpdateDebt(
  studentId: string,
  periodYear: number,
  periodMonth: number,
  options: GenerateOptions = {},
): Promise<DebtRow> {
  const student: any = await prisma.student.findUnique({
    where: { id: studentId },
    include: { profile: true },
  });
  if (!student) {
    throw new Error(`Student ${studentId} not found`);
  }

  const [feeRulesRaw, surchargeRulesRaw, existingDebt, allPayments] = await Promise.all([
    prisma.feeRule.findMany({ orderBy: { effectiveFrom: 'desc' } }),
    prisma.lateSurchargeRule.findMany({ orderBy: { effectiveFrom: 'desc' } }),
    prisma.debt.findUnique({
      where: {
        studentId_periodYear_periodMonth: {
          studentId,
          periodYear,
          periodMonth,
        },
      },
    }),
    prisma.payment.findMany({
      where: {
        studentId,
        debtId: { not: null },
        status: 'approved',
      },
      select: { amount: true, debtId: true },
    }),
  ]);

  // Calcular paidAmount de los pagos aprobados para esta deuda específica.
  let paidAmount = 0;
  if (existingDebt) {
    const existingId = (existingDebt as DebtRow).id;
    paidAmount = (allPayments as Array<{ amount: unknown; debtId: string | null }>)
      .filter((p) => p.debtId === existingId)
      .reduce((sum, p) => sum + toNumber(p.amount), 0);
  }

  const feeRules: FeeRuleInput[] = (feeRulesRaw as unknown as FeeRuleRow[]).map((r) => ({
    id: r.id,
    daysPerWeek: r.daysPerWeek,
    monthlyAmount: toNumber(r.monthlyAmount),
    effectiveFrom: r.effectiveFrom,
    effectiveUntil: r.effectiveUntil,
    active: r.active,
  }));

  const surchargeRules: LateSurchargeRuleInput[] = (
    surchargeRulesRaw as unknown as SurchargeRuleRow[]
  ).map((r) => ({
    id: r.id,
    graceDays: r.graceDays,
    surchargePct: toNumber(r.surchargePct),
    effectiveFrom: r.effectiveFrom,
    effectiveUntil: r.effectiveUntil,
    active: r.active,
  }));

  const today = new Date();
  const dueDate = options.dueDate ?? getDefaultDueDate(periodYear, periodMonth);
  const manualAdjustment =
    options.manualAdjustment !== undefined
      ? options.manualAdjustment
      : existingDebt
      ? toNumber((existingDebt as DebtRow).manualAdjustment)
      : 0;
  const manualNote =
    options.manualNote !== undefined
      ? options.manualNote
      : ((existingDebt as DebtRow | null)?.manualNote ?? null);

  const computation = computeDebt(
    {
      id: student.id,
      joinedAt: student.joinedAt,
      profile: student.profile
        ? { attendanceDaysPerWeek: student.profile.attendanceDaysPerWeek }
        : null,
    },
    periodYear,
    periodMonth,
    feeRules,
    surchargeRules,
    manualAdjustment,
    paidAmount,
    today,
    dueDate,
  );

  if (!computation) {
    if (existingDebt) return existingDebt as DebtRow;
    throw new Error(
      `No se puede generar deuda: no hay FeeRule aplicable para ${student.profile?.attendanceDaysPerWeek ?? 0} días/sem`,
    );
  }

  const status = recomputeDebtStatus(
    computation.totalAmount,
    paidAmount,
    computation.dueDate,
    today,
  );

  const debt = (await prisma.debt.upsert({
    where: {
      studentId_periodYear_periodMonth: {
        studentId,
        periodYear,
        periodMonth,
      },
    },
    create: {
      studentId,
      periodYear,
      periodMonth,
      baseAmount: computation.baseAmount,
      surchargeAmount: computation.surchargeAmount,
      manualAdjustment: computation.manualAdjustment,
      totalAmount: computation.totalAmount,
      paidAmount,
      dueDate: computation.dueDate,
      status,
      manualNote,
      generatedAt: today,
    },
    update: {
      paidAmount,
      baseAmount: computation.baseAmount,
      surchargeAmount: computation.surchargeAmount,
      manualAdjustment: computation.manualAdjustment,
      totalAmount: computation.totalAmount,
      dueDate: computation.dueDate,
      status,
      manualNote,
    },
  })) as DebtRow;

  return debt;
}

/**
 * Genera las deudas del mes indicado para todos los alumnos activos.
 * Retorna contadores y errores por alumno.
 */
export async function generateMonthlyDebts(
  periodYear: number,
  periodMonth: number,
  options: { dryRun?: boolean } = {},
): Promise<{ generated: number; skipped: number; errors: string[] }> {
  const students: Array<{ id: string; firstName: string; lastName: string }> = await prisma.student.findMany({
    where: { active: true },
    select: { id: true, firstName: true, lastName: true },
  });

  let generated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const student of students) {
    try {
      const existing = await prisma.debt.findUnique({
        where: {
          studentId_periodYear_periodMonth: {
            studentId: student.id,
            periodYear,
            periodMonth,
          },
        },
      });
      if (existing && options.dryRun) {
        skipped += 1;
        continue;
      }
      if (options.dryRun) {
        const studentWithProfile: any = await prisma.student.findUnique({
          where: { id: student.id },
          include: { profile: true },
        });
        if (!studentWithProfile?.profile || studentWithProfile.profile.attendanceDaysPerWeek <= 0) {
          skipped += 1;
          continue;
        }
        generated += 1;
        continue;
      }

      await generateOrUpdateDebt(student.id, periodYear, periodMonth);
      generated += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      errors.push(`${student.firstName} ${student.lastName} (${student.id}): ${msg}`);
      skipped += 1;
    }
  }

  return { generated, skipped, errors };
}

/**
 * Marca como 'overdue' todas las deudas pending/partial cuyo dueDate ya pasó.
 * Retorna la cantidad de deudas marcadas.
 */
export async function markOverdueDebts(today: Date = new Date()): Promise<number> {
  const debts = (await prisma.debt.findMany({
    where: {
      status: { in: ['pending', 'partial'] },
      dueDate: { lt: today },
    },
    select: { id: true, status: true, totalAmount: true, paidAmount: true, dueDate: true },
  })) as Array<{ id: string; totalAmount: unknown; paidAmount: unknown }>;

  let count = 0;
  for (const debt of debts) {
    const paid = toNumber(debt.paidAmount);
    const total = toNumber(debt.totalAmount);
    if (paid >= total) continue;
    await prisma.debt.update({
      where: { id: debt.id },
      data: { status: 'overdue' },
    });
    count += 1;
  }
  return count;
}

/**
 * Recalcula paidAmount y status de una Debt sumando todos sus pagos approved.
 */
export async function recomputeDebtFromPayments(debtId: string): Promise<DebtStatus> {
  const debt = (await prisma.debt.findUnique({ where: { id: debtId } })) as DebtRow | null;
  if (!debt) throw new Error(`Debt ${debtId} not found`);

  const payments = (await prisma.payment.findMany({
    where: { debtId, status: 'approved' },
    select: { amount: true },
  })) as Array<{ amount: unknown }>;
  const paidAmount = round2(
    payments.reduce((sum, p) => sum + toNumber(p.amount), 0),
  );
  const total = toNumber(debt.totalAmount);
  const status = recomputeDebtStatus(total, paidAmount, debt.dueDate, new Date());

  await prisma.debt.update({
    where: { id: debtId },
    data: { paidAmount, status },
  });

  return status;
}

/**
 * Recalcula surchargeAmount + totalAmount + status de una deuda aplicando las
 * reglas de recargo vigentes hoy. Usado al ajustar manualmente una deuda o
 * cuando cambian las reglas.
 */
export async function recomputeDebtSurchargeAndStatus(debtId: string): Promise<DebtStatus> {
  const debt: any = await prisma.debt.findUnique({
    where: { id: debtId },
    include: { student: { include: { profile: true } } },
  });
  if (!debt) throw new Error(`Debt ${debtId} not found`);

  const [feeRulesRaw, surchargeRulesRaw] = await Promise.all([
    prisma.feeRule.findMany({ orderBy: { effectiveFrom: 'desc' } }),
    prisma.lateSurchargeRule.findMany({ orderBy: { effectiveFrom: 'desc' } }),
  ]);

  const feeRules: FeeRuleInput[] = (feeRulesRaw as unknown as FeeRuleRow[]).map((r) => ({
    id: r.id,
    daysPerWeek: r.daysPerWeek,
    monthlyAmount: toNumber(r.monthlyAmount),
    effectiveFrom: r.effectiveFrom,
    effectiveUntil: r.effectiveUntil,
    active: r.active,
  }));
  const surchargeRules: LateSurchargeRuleInput[] = (
    surchargeRulesRaw as unknown as SurchargeRuleRow[]
  ).map((r) => ({
    id: r.id,
    graceDays: r.graceDays,
    surchargePct: toNumber(r.surchargePct),
    effectiveFrom: r.effectiveFrom,
    effectiveUntil: r.effectiveUntil,
    active: r.active,
  }));

  const today = new Date();
  const daysPerWeek = debt.student?.profile?.attendanceDaysPerWeek ?? 0;
  const fee = resolveFeeRule(feeRules, daysPerWeek, today);
  if (!fee) {
    return debt.status as DebtStatus;
  }

  const baseAmount = fee.monthlyAmount;
  const manualAdj = toNumber(debt.manualAdjustment);
  const paidAmount = toNumber(debt.paidAmount);

  let surchargeAmount = 0;
  if (paidAmount < baseAmount + manualAdj) {
    const surcharge = resolveSurchargeRule(surchargeRules, today);
    if (surcharge && today.getDate() > surcharge.graceDays) {
      surchargeAmount = round2(((baseAmount + manualAdj) * surcharge.surchargePct) / 100);
    }
  }

  const totalAmount = round2(baseAmount + surchargeAmount + manualAdj);
  const status = recomputeDebtStatus(totalAmount, paidAmount, debt.dueDate, today);

  await prisma.debt.update({
    where: { id: debtId },
    data: {
      baseAmount,
      surchargeAmount,
      totalAmount,
      status,
    },
  });

  return status;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Helper: genera las deudas del mes anterior (llamado desde cron / botón admin).
 */
export async function generatePreviousMonthDebts(options: { dryRun?: boolean } = {}) {
  const ref = new Date();
  const prev = previousMonth(ref);
  return generateMonthlyDebts(prev.year, prev.month, options);
}