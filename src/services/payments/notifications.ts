// Orquestador de notificaciones: email a admins / alumno y WhatsApp al alumno.
// Deduplicación por día usando `NotificationLog` (channel + template + relatedStudentId + relatedDebtId).

import 'server-only';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/services/email';
import { sendWhatsapp } from '@/services/wasender';
import { emailTemplates, whatsappTemplates } from '@/services/email/templates';
import { monthName } from '@/lib/schedule';
import { getSiteUrl } from '@/lib/site-url';

// =====================================================
// Helpers
// =====================================================

interface NotificationLoggerInput {
  channel: 'email' | 'whatsapp';
  recipient: string;
  template: string;
  relatedStudentId?: string;
  relatedDebtId?: string;
  payload: Record<string, unknown>;
  status: 'sent' | 'failed' | 'skipped';
  errorMessage?: string;
}

async function logNotification(input: NotificationLoggerInput): Promise<void> {
  try {
    await prisma.notificationLog.create({
      data: {
        channel: input.channel,
        recipient: input.recipient,
        template: input.template,
        relatedStudentId: input.relatedStudentId,
        relatedDebtId: input.relatedDebtId,
        payload: JSON.stringify(input.payload),
        status: input.status,
        errorMessage: input.errorMessage,
        sentAt: input.status === 'sent' ? new Date() : null,
      },
    });
  } catch (e) {
    // Nunca fallar el flujo principal por un log roto.
    // eslint-disable-next-line no-console
    console.error('[notifications] logNotification failed:', e);
  }
}

/** True si ya se envió esta notificación hoy. Usado para deduplicar recordatorios. */
async function alreadySentToday(
  channel: string,
  template: string,
  relatedStudentId: string,
  relatedDebtId?: string,
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const count = await prisma.notificationLog.count({
    where: {
      channel,
      template,
      relatedStudentId,
      relatedDebtId,
      status: 'sent',
      sentAt: { gte: today },
    },
  });
  return count > 0;
}

// =====================================================
// Tipos permisivos para los pagos/students (Prisma + spread)
// =====================================================

interface StudentLite {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  whatsapp: string | null;
}

interface PaymentLite {
  id: string;
  amount: string | number; // Prisma Decimal como string; a veces number si fue convertido
  paidAt: Date | null;
  status: string;
}

interface DebtLite {
  id: string;
  totalAmount: string | number;
  paidAmount: string | number;
  periodMonth: number;
  periodYear: number;
  dueDate: Date;
}

// =====================================================
// Notificaciones públicas
// =====================================================

export async function sendPaymentReceivedNotifications(
  student: StudentLite,
  payment: PaymentLite,
  debt: DebtLite,
): Promise<void> {
  const period = `${monthName(debt.periodMonth)} ${debt.periodYear}`;
  const total = Number(debt.totalAmount);
  const paid = Number(debt.paidAmount);
  const balance = Math.max(0, total - paid);
  const amount = Number(payment.amount);
  const paidAtStr =
    payment.paidAt?.toLocaleDateString('es-AR', { dateStyle: 'medium' }) ||
    new Date().toLocaleDateString('es-AR', { dateStyle: 'medium' });
  const siteUrl = getSiteUrl();
  const deudaUrl = `${siteUrl}/alumno/deuda`;

  // 1) Email a cada admin
  const admins = await prisma.adminUser.findMany({
    select: { email: true, name: true },
  });
  for (const admin of admins) {
    const html = emailTemplates.paymentReceivedAdmin({
      studentName: `${student.firstName} ${student.lastName}`,
      amount,
      period,
      paidAt: paidAtStr,
    });
    const result = await sendEmail({
      to: admin.email,
      subject: `Pago recibido de ${student.firstName} ${student.lastName}`,
      html,
    });
    await logNotification({
      channel: 'email',
      recipient: admin.email,
      template: 'payment_received_admin',
      relatedStudentId: student.id,
      relatedDebtId: debt.id,
      payload: { adminName: admin.name, amount, period },
      status: result.ok ? 'sent' : 'failed',
      errorMessage: result.error,
    });
  }

  // 2) Email al alumno
  if (student.email) {
    const html = emailTemplates.paymentReceived({
      firstName: student.firstName,
      amount,
      period,
      balance,
      deudaUrl,
    });
    const emailResult = await sendEmail({
      to: student.email,
      subject: 'Pago recibido',
      html,
    });
    await logNotification({
      channel: 'email',
      recipient: student.email,
      template: 'payment_received',
      relatedStudentId: student.id,
      relatedDebtId: debt.id,
      payload: { amount, period, balance },
      status: emailResult.ok ? 'sent' : 'failed',
      errorMessage: emailResult.error,
    });
  }

  // 3) WhatsApp al alumno
  if (student.whatsapp) {
    const text = whatsappTemplates.paymentReceived({
      firstName: student.firstName,
      amount,
      period,
    });
    const wa = await sendWhatsapp(student.whatsapp, text);
    await logNotification({
      channel: 'whatsapp',
      recipient: student.whatsapp,
      template: 'payment_received',
      relatedStudentId: student.id,
      relatedDebtId: debt.id,
      payload: { amount, period },
      status: wa.ok ? 'sent' : 'failed',
      errorMessage: wa.error,
    });
  }
}

export async function sendDueReminder(
  student: StudentLite,
  debt: DebtLite,
): Promise<void> {
  if (await alreadySentToday('whatsapp', 'due_reminder', student.id, debt.id)) return;
  if (await alreadySentToday('email', 'due_reminder', student.id, debt.id)) return;

  const period = `${monthName(debt.periodMonth)} ${debt.periodYear}`;
  const total = Number(debt.totalAmount);
  const paid = Number(debt.paidAmount);
  const amount = Math.max(0, total - paid);
  const dueDateStr = debt.dueDate.toLocaleDateString('es-AR', { dateStyle: 'medium' });
  const siteUrl = getSiteUrl();
  const deudaUrl = `${siteUrl}/alumno/deuda`;

  if (student.whatsapp) {
    const text = whatsappTemplates.dueReminder({
      firstName: student.firstName,
      amount,
      period,
      dueDate: dueDateStr,
    });
    const wa = await sendWhatsapp(student.whatsapp, text);
    await logNotification({
      channel: 'whatsapp',
      recipient: student.whatsapp,
      template: 'due_reminder',
      relatedStudentId: student.id,
      relatedDebtId: debt.id,
      payload: { amount, period, dueDate: dueDateStr },
      status: wa.ok ? 'sent' : 'failed',
      errorMessage: wa.error,
    });
  }

  if (student.email) {
    const html = emailTemplates.dueReminder({
      firstName: student.firstName,
      amount,
      period,
      dueDate: dueDateStr,
      deudaUrl,
    });
    const em = await sendEmail({
      to: student.email,
      subject: `Cuota ${period} disponible`,
      html,
    });
    await logNotification({
      channel: 'email',
      recipient: student.email,
      template: 'due_reminder',
      relatedStudentId: student.id,
      relatedDebtId: debt.id,
      payload: { amount, period, dueDate: dueDateStr },
      status: em.ok ? 'sent' : 'failed',
      errorMessage: em.error,
    });
  }
}

export async function sendOverdueNotification(
  student: StudentLite,
  debt: DebtLite,
): Promise<void> {
  if (await alreadySentToday('whatsapp', 'overdue_notice', student.id, debt.id)) return;
  if (await alreadySentToday('email', 'overdue_notice', student.id, debt.id)) return;

  const period = `${monthName(debt.periodMonth)} ${debt.periodYear}`;
  const total = Number(debt.totalAmount);
  const paid = Number(debt.paidAmount);
  const amount = Math.max(0, total - paid);
  const daysOverdue = Math.max(
    0,
    Math.floor((Date.now() - debt.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const siteUrl = getSiteUrl();
  const deudaUrl = `${siteUrl}/alumno/deuda`;

  if (student.whatsapp) {
    const text = whatsappTemplates.overdue({
      firstName: student.firstName,
      amount,
      period,
    });
    const wa = await sendWhatsapp(student.whatsapp, text);
    await logNotification({
      channel: 'whatsapp',
      recipient: student.whatsapp,
      template: 'overdue_notice',
      relatedStudentId: student.id,
      relatedDebtId: debt.id,
      payload: { amount, period, daysOverdue },
      status: wa.ok ? 'sent' : 'failed',
      errorMessage: wa.error,
    });
  }

  if (student.email) {
    const html = emailTemplates.overdue({
      firstName: student.firstName,
      amount,
      period,
      daysOverdue,
      deudaUrl,
    });
    const em = await sendEmail({
      to: student.email,
      subject: `Cuota ${period} atrasada`,
      html,
    });
    await logNotification({
      channel: 'email',
      recipient: student.email,
      template: 'overdue_notice',
      relatedStudentId: student.id,
      relatedDebtId: debt.id,
      payload: { amount, period, daysOverdue },
      status: em.ok ? 'sent' : 'failed',
      errorMessage: em.error,
    });
  }
}

export async function sendWelcomeNotifications(
  student: StudentLite,
  initialPassword: string,
): Promise<void> {
  const siteUrl = getSiteUrl();
  const loginUrl = `${siteUrl}/alumno/login`;

  if (student.email) {
    const html = emailTemplates.welcome({
      firstName: student.firstName,
      email: student.email,
      initialPassword,
      loginUrl,
    });
    const em = await sendEmail({
      to: student.email,
      subject: 'Bienvenido al Dojo Shiroi Ryu',
      html,
    });
    await logNotification({
      channel: 'email',
      recipient: student.email,
      template: 'welcome',
      relatedStudentId: student.id,
      payload: { initialPassword, loginUrl },
      status: em.ok ? 'sent' : 'failed',
      errorMessage: em.error,
    });
  }

  if (student.whatsapp) {
    const text = whatsappTemplates.welcome({ firstName: student.firstName });
    const wa = await sendWhatsapp(student.whatsapp, text);
    await logNotification({
      channel: 'whatsapp',
      recipient: student.whatsapp,
      template: 'welcome',
      relatedStudentId: student.id,
      payload: {},
      status: wa.ok ? 'sent' : 'failed',
      errorMessage: wa.error,
    });
  }
}

export async function sendPasswordResetEmail(
  student: StudentLite,
  resetUrl: string,
): Promise<void> {
  if (!student.email) return;
  const html = emailTemplates.passwordReset({
    firstName: student.firstName,
    resetUrl,
  });
  const em = await sendEmail({
    to: student.email,
    subject: 'Restablecer tu contraseña',
    html,
  });
  await logNotification({
    channel: 'email',
    recipient: student.email,
    template: 'password_reset',
    relatedStudentId: student.id,
    payload: { resetUrl },
    status: em.ok ? 'sent' : 'failed',
    errorMessage: em.error,
  });
}
