// /api/cron/overdue — marca deudas vencidas como `overdue` y notifica.
//
// Modos de invocación:
// 1. Vercel Cron (automático): header `Authorization: Bearer ${CRON_SECRET}`.
// 2. Manual desde /admin/pagos o /admin/cron: sesión admin válida (no requiere CRON_SECRET).

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { verifyCronSecret, cronUnauthorizedResponse } from '@/lib/cron-secret';
import { runOverdueCron } from '@/services/payments/cron-jobs';
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
    message: 'Probe OK. Ejecutá POST para verificar deudas vencidas y enviar recordatorios.',
  });
}

export async function POST(req: NextRequest) {
  const cronAuth = verifyCronSecret(req);
  const adminSession = await getAdminSession();
  if (!cronAuth && !adminSession) return cronUnauthorizedResponse();

  // Determinar el trigger para el log.
  let trigger: CronTrigger = 'cron_vercel';
  if (!cronAuth && adminSession) {
    trigger = adminSession.role === 'superadmin' ? 'manual_superadmin' : 'manual_admin';
  }

  try {
    const result = await trackCronRun(
      {
        jobName: 'overdue_check',
        trigger,
        triggeredBy: adminSession?.userId ?? null,
      },
      () => runOverdueCron(),
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
  result: Awaited<ReturnType<typeof runOverdueCron>>,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'cron_run_overdue',
      entity: 'cron',
      metadata: JSON.stringify({
        markedOverdue: result.markedOverdue,
        notificationsSent: result.notificationsSent,
      }),
    },
  });
}
