// Reconciliación idempotente entre Mercado Pago y la base local.
// Se invoca desde el webhook (`/api/pagos/webhooks/mercadopago`) o manualmente.
//
// Reglas:
//  - Si el Payment ya está 'approved', no tocamos nada (idempotencia).
//  - Si pasa a 'approved', recalculamos la deuda (`recomputeDebtFromPayments`)
//    y disparamos las notificaciones al alumno + admins.

import 'server-only';
import { prisma } from '@/lib/db';
import { getPayment } from '@/services/mercadopago';
import { recomputeDebtFromPayments } from '@/services/payments/fee-engine';
import { sendPaymentReceivedNotifications } from '@/services/payments/notifications';

export type ReconcileStatus = 'ok' | 'not-found' | 'error';

export interface ReconcileResult {
  status: ReconcileStatus;
  message?: string;
}

/**
 * Reconcilia un pago de MP con la DB local. Idempotente:
 * si el Payment ya está `approved`, retorna `{ status: 'ok' }` sin tocar nada.
 */
export async function reconcilePayment(
  mpPaymentId: string | number,
): Promise<ReconcileResult> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { mpPaymentId: String(mpPaymentId) },
      include: { debt: true, student: true },
    });
    if (!payment) {
      return { status: 'not-found', message: 'Payment no encontrado localmente' };
    }
    if (payment.status === 'approved') {
      return { status: 'ok' };
    }

    const mp = await getPayment(mpPaymentId);

    const status =
      mp.status === 'approved'
        ? 'approved'
        : mp.status === 'rejected'
          ? 'rejected'
          : mp.status === 'refunded'
            ? 'refunded'
            : 'pending';

    const paidAt = mp.date_approved ? new Date(mp.date_approved) : null;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        mpStatus: mp.status,
        mpStatusDetail: mp.status_detail,
        paidAt,
        amount: mp.transaction_amount.toFixed(2),
      },
    });

    // Si está asociado a una deuda y pasó a approved, recalculamos la deuda
    // con el helper compartido del fee engine.
    let debtForNotification: Awaited<ReturnType<typeof prisma.debt.findUnique>> | null = null;

    if (payment.debtId && status === 'approved') {
      await recomputeDebtFromPayments(payment.debtId);
      debtForNotification = await prisma.debt.findUnique({
        where: { id: payment.debtId },
      });
    }

    // Marcamos los webhook events pendientes como procesados.
    await prisma.paymentWebhookEvent.updateMany({
      where: { mpPaymentId: String(mpPaymentId), processed: false },
      data: { processed: true, processedAt: new Date() },
    });

    // Notificaciones: solo si la deuda se afectó y el pago está aprobado.
    if (debtForNotification && status === 'approved') {
      try {
        await sendPaymentReceivedNotifications(
          {
            id: payment.student.id,
            email: payment.student.email,
            firstName: payment.student.firstName,
            lastName: payment.student.lastName,
            whatsapp: payment.student.whatsapp,
          },
          {
            id: payment.id,
            amount: mp.transaction_amount,
            paidAt,
            status: 'approved',
          },
          {
            id: debtForNotification.id,
            totalAmount: Number(debtForNotification.totalAmount),
            paidAmount: Number(debtForNotification.paidAmount),
            periodMonth: debtForNotification.periodMonth,
            periodYear: debtForNotification.periodYear,
            dueDate: debtForNotification.dueDate,
          },
        );
      } catch (notifErr) {
        // No rompemos la reconciliación si falla la notificación.
        // eslint-disable-next-line no-console
        console.error('[reconcile] notification error:', notifErr);
      }
    }

    return { status: 'ok' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.paymentWebhookEvent
      .updateMany({
        where: { mpPaymentId: String(mpPaymentId), processed: false },
        data: { processed: false, errorMessage: msg },
      })
      .catch(() => {
        /* ignore */
      });
    return { status: 'error', message: msg };
  }
}
