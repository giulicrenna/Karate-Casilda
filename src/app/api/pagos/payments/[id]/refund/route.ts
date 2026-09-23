import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { refundPayment } from '@/services/mercadopago';
import { recomputeDebtFromPayments } from '@/services/payments/fee-engine';

export const runtime = 'nodejs';

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/pagos/payments/[id]/refund
 *
 * Admin: revierte un pago aprobado en MP, marca `status='refunded'`
 * y recalcula la deuda asociada.
 *
 * Body opcional: { amount?: number } — reembolso parcial.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { debt: true },
  });
  if (!payment) {
    return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
  }
  if (payment.status !== 'approved') {
    return NextResponse.json(
      { error: 'Solo se pueden revertir pagos aprobados.' },
      { status: 400 },
    );
  }
  if (!payment.mpPaymentId) {
    return NextResponse.json(
      { error: 'El pago no está asociado a Mercado Pago.' },
      { status: 400 },
    );
  }

  let amount: number | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (body && typeof body.amount === 'number' && body.amount > 0) {
      amount = body.amount;
    }
  } catch {
    /* body vacío, reembolso total */
  }

  try {
    await refundPayment(payment.mpPaymentId, amount);
  } catch (e) {
    return NextResponse.json(
      {
        error: 'Error al revertir el pago en Mercado Pago.',
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 502 },
    );
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'refunded',
      mpStatus: 'refunded',
      metadata: JSON.stringify({
        ...safeParse(payment.metadata),
        refund: { amount: amount ?? null, at: new Date().toISOString() },
      }),
    },
  });

  // Recalcular deuda (queda pendiente con el saldo restante).
  let newDebtStatus: string | null = null;
  if (payment.debtId) {
    newDebtStatus = await recomputeDebtFromPayments(payment.debtId);
  }

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'payment_refunded',
      entity: 'payment',
      entityId: payment.id,
      metadata: JSON.stringify({
        mpPaymentId: payment.mpPaymentId,
        amount,
        newDebtStatus,
      }),
    },
  });

  return NextResponse.json({ ok: true, status: 'refunded', debtStatus: newDebtStatus });
}

function safeParse(s: string | null | undefined): Record<string, unknown> {
  if (!s) return {};
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
