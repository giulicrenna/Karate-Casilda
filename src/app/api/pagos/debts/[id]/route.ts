import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DebtAdjustmentSchema } from '@/lib/validation';
import {
  recomputeDebtFromPayments,
  recomputeDebtSurchargeAndStatus,
} from '@/services/payments/fee-engine';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const debt = await prisma.debt.findUnique({
    where: { id: params.id },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!debt) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  return NextResponse.json({
    ...debt,
    baseAmount: Number(debt.baseAmount),
    surchargeAmount: Number(debt.surchargeAmount),
    manualAdjustment: Number(debt.manualAdjustment),
    totalAmount: Number(debt.totalAmount),
    paidAmount: Number(debt.paidAmount),
    payments: debt.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = DebtAdjustmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.debt.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  if (existing.status === 'cancelled') {
    return NextResponse.json({ error: 'No se puede ajustar una deuda cancelada' }, { status: 400 });
  }

  // Aplicar ajuste manual + nota.
  await prisma.debt.update({
    where: { id: params.id },
    data: {
      manualAdjustment: data.manualAdjustment,
      manualNote: data.manualNote ?? null,
    },
  });

  // Recalcular surcharge + status contra las reglas vigentes hoy.
  const newStatus = await recomputeDebtSurchargeAndStatus(params.id);
  // Recalcular paidAmount desde los pagos aprobados.
  await recomputeDebtFromPayments(params.id);

  const updated = await prisma.debt.findUnique({ where: { id: params.id } });
  if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'adjust_debt',
      entity: 'debt',
      entityId: params.id,
      metadata: JSON.stringify({
        manualAdjustment: data.manualAdjustment,
        manualNote: data.manualNote ?? null,
        newStatus,
      }),
    },
  });

  return NextResponse.json({
    ...updated,
    baseAmount: Number(updated.baseAmount),
    surchargeAmount: Number(updated.surchargeAmount),
    manualAdjustment: Number(updated.manualAdjustment),
    totalAmount: Number(updated.totalAmount),
    paidAmount: Number(updated.paidAmount),
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const existing = await prisma.debt.findUnique({
    where: { id: params.id },
    include: { payments: true },
  });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  // Si tiene pagos asociados, NO se puede cancelar.
  const hasApproved = existing.payments.some((p) => p.status === 'approved');
  if (hasApproved) {
    return NextResponse.json(
      { error: 'No se puede cancelar: la deuda tiene pagos aprobados' },
      { status: 400 },
    );
  }

  await prisma.debt.update({
    where: { id: params.id },
    data: { status: 'cancelled' },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'cancel_debt',
      entity: 'debt',
      entityId: params.id,
    },
  });

  return NextResponse.json({ ok: true });
}