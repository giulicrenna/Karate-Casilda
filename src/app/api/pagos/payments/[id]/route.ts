import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { recomputeDebtFromPayments } from '@/services/payments/fee-engine';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      debt: { select: { id: true, periodYear: true, periodMonth: true } },
    },
  });
  if (!payment) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  return NextResponse.json({
    ...payment,
    amount: Number(payment.amount),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: { action?: 'cancel' } = {};
  try {
    body = await req.json();
  } catch {
    // Permitimos body vacío: cancel por defecto.
  }
  const action = body?.action ?? 'cancel';

  const existing = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  if (existing.status === 'cancelled' || existing.status === 'refunded') {
    return NextResponse.json({ error: 'El pago ya fue anulado' }, { status: 400 });
  }

  if (action !== 'cancel') {
    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
  }

  await prisma.payment.update({
    where: { id: params.id },
    data: {
      status: 'cancelled',
    },
  });

  // Recalcular la deuda asociada.
  let newDebtStatus = null;
  if (existing.debtId) {
    newDebtStatus = await recomputeDebtFromPayments(existing.debtId);
  }

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'cancel_payment',
      entity: 'payment',
      entityId: params.id,
      metadata: JSON.stringify({
        previousStatus: existing.status,
        debtId: existing.debtId,
        newDebtStatus,
      }),
    },
  });

  return NextResponse.json({ ok: true, newDebtStatus });
}