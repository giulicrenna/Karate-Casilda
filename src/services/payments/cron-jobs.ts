// Orquestadores de los cron jobs. Funciones puras que pueden invocarse desde
// las rutas /api/cron/* o desde botones manuales del panel admin.
//
// - runMonthlyCron: genera deudas del mes anterior (o del período recibido)
//   y envía recordatorios por WhatsApp/email a cada alumno.
// - runOverdueCron: marca deudas vencidas como `overdue` y notifica con
//   deduplicación diaria vía NotificationLog.

import 'server-only';
import { prisma } from '@/lib/db';
import {
  generateMonthlyDebts,
  markOverdueDebts,
} from '@/services/payments/fee-engine';
import {
  sendDueReminder,
  sendOverdueNotification,
} from '@/services/payments/notifications';
import { previousMonth } from '@/lib/schedule';

export interface MonthlyCronResult {
  generated: number;
  skipped: number;
  errors: string[];
  notificationsSent: number;
  periodYear: number;
  periodMonth: number;
}

/**
 * Genera las deudas del período (por defecto: mes anterior) y notifica.
 * Idempotente: si las deudas ya existen, las actualiza sin duplicar.
 */
export async function runMonthlyCron(
  year?: number,
  month?: number,
): Promise<MonthlyCronResult> {
  if (!year || !month) {
    const ref = new Date();
    const prev = previousMonth(ref);
    year = prev.year;
    month = prev.month;
  }

  const result = await generateMonthlyDebts(year, month);

  // Recuperar las deudas (nuevas o actualizadas) y enviar recordatorios.
  // Para no romper el job, los errores de notificación se registran pero no
  // detienen el flujo.
  const debts = await prisma.debt.findMany({
    where: {
      periodYear: year,
      periodMonth: month,
      status: { in: ['pending', 'partial'] },
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          whatsapp: true,
          active: true,
        },
      },
    },
  });

  let notificationsSent = 0;
  for (const debt of debts) {
    if (!debt.student.active) continue;
    if (!debt.student.whatsapp && !debt.student.email) continue;
    try {
      await sendDueReminder(debt.student, {
        id: debt.id,
        totalAmount: Number(debt.totalAmount),
        paidAmount: Number(debt.paidAmount),
        periodMonth: debt.periodMonth,
        periodYear: debt.periodYear,
        dueDate: debt.dueDate,
      });
      notificationsSent += 1;
    } catch {
      // swallow: un fallo individual no debe tumbar el job
    }
  }

  return {
    generated: result.generated,
    skipped: result.skipped,
    errors: result.errors,
    notificationsSent,
    periodYear: year,
    periodMonth: month,
  };
}

export interface OverdueCronResult {
  markedOverdue: number;
  notificationsSent: number;
}

/**
 * Marca deudas vencidas como `overdue` y envía notificaciones con dedup
 * diaria (NotificationLog).
 */
export async function runOverdueCron(): Promise<OverdueCronResult> {
  const marked = await markOverdueDebts(new Date());

  const overdueDebts = await prisma.debt.findMany({
    where: {
      status: 'overdue',
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          whatsapp: true,
          active: true,
        },
      },
    },
  });

  // Prisma no permite comparar Decimal a Decimal directamente en queries;
  // filtramos en memoria comparando paidAmount < totalAmount.
  const actuallyOverdue: typeof overdueDebts = [];
  for (const d of overdueDebts) {
    const paid = parseFloat(d.paidAmount.toString());
    const total = parseFloat(d.totalAmount.toString());
    if (paid < total) actuallyOverdue.push(d);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let sent = 0;
  for (const debt of actuallyOverdue) {
    if (!debt.student.active) continue;
    if (!debt.student.whatsapp && !debt.student.email) continue;

    // Dedup: ya enviado hoy
    const recent = await prisma.notificationLog.count({
      where: {
        relatedDebtId: debt.id,
        template: 'overdue_notice',
        status: 'sent',
        sentAt: { gte: today },
      },
    });
    if (recent > 0) continue;

    try {
      await sendOverdueNotification(debt.student, {
        id: debt.id,
        totalAmount: Number(debt.totalAmount),
        paidAmount: Number(debt.paidAmount),
        periodMonth: debt.periodMonth,
        periodYear: debt.periodYear,
        dueDate: debt.dueDate,
      });
      sent += 1;
    } catch {
      // swallow
    }
  }

  return { markedOverdue: marked, notificationsSent: sent };
}