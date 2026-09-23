// /api/cron/monthly — genera las deudas del mes anterior y envía recordatorios.
//
// Modos de invocación:
// 1. Vercel Cron (automático): header `Authorization: Bearer ${CRON_SECRET}`.
// 2. Manual desde /admin/pagos o /admin/cron: sesión admin válida (no requiere CRON_SECRET).
//
// Body opcional: { year?: number, month?: number } para override de período.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { verifyCronSecret, cronUnauthorizedResponse } from '@/lib/cron-secret';
import { runMonthlyCron } from '@/services/payments/cron-jobs';
import { trackCronRun, type CronTrigger } from '@/services/payments/cron-runner';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET = probe. Útil para verificar configuración desde el panel o monitoring. */
export async function GET(req: NextRequest) {
  const cronAuth = verifyCronSecret(req);
  const adminSession = await getAdminSession();
  if (!cronAuth && !adminSession) return cronUnauthorizedResponse();

  return NextResponse.json({
    ok: true,
    mode: cronAuth ? 'cron' : 'admin',
    message:
      'Probe OK. Ejecutá POST para correr la generación de deudas del mes anterior.',
  });
}

export async function POST(req: NextRequest) {
  const cronAuth = verifyCronSecret(req);
  const adminSession = await getAdminSession();
  if (!cronAuth && !adminSession) return cronUnauthorizedResponse();

  let year: number | undefined;
  let month: number | undefined;
  try {
    // Body es opcional. Si no se envía, se usa el mes anterior.
    const text = await req.text();
    if (text.trim().length > 0) {
      const body = JSON.parse(text);
      if (body && typeof body === 'object') {
        if (typeof body.year === 'number') year = body.year;
        if (typeof body.month === 'number') month = body.month;
      }
    }
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  // Determinar el trigger para el log.
  let trigger: CronTrigger = 'cron_vercel';
  if (!cronAuth && adminSession) {
    trigger = adminSession.role === 'superadmin' ? 'manual_superadmin' : 'manual_admin';
  }

  try {
    const result = await trackCronRun(
      {
        jobName: 'monthly_debts',
        trigger,
        triggeredBy: adminSession?.userId ?? null,
        metadata: { periodYear: year ?? null, periodMonth: month ?? null },
      },
      () => runMonthlyCron(year, month),
    );

    if (adminSession && !cronAuth) {
      // Disparado manualmente desde el panel → dejamos auditoría (paralela a CronRun).
      await prismaAudit(adminSession.userId, result);
    }

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function prismaAudit(
  userId: string,
  result: Awaited<ReturnType<typeof runMonthlyCron>>,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'cron_run_monthly',
      entity: 'cron',
      metadata: JSON.stringify({
        periodYear: result.periodYear,
        periodMonth: result.periodMonth,
        generated: result.generated,
        skipped: result.skipped,
        errors: result.errors.length,
        notificationsSent: result.notificationsSent,
      }),
    },
  });
}
