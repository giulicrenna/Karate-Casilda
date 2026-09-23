// /api/admin/cron-runs — listado paginado y filtrable de CronRun.
// Solo accesible para administradores autenticados (admin y superadmin).

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_JOB = ['monthly_debts', 'overdue_check'] as const;
const ALLOWED_STATUS = ['running', 'success', 'failed'] as const;
const ALLOWED_TRIGGER = [
  'cron_vercel',
  'manual_admin',
  'manual_superadmin',
  'system',
] as const;

export async function GET(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  // Solo admin y superadmin (los editores no tienen acceso).
  if (s.role === 'editor') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const url = new URL(req.url);
  const jobName = url.searchParams.get('jobName') ?? '';
  const status = url.searchParams.get('status') ?? '';
  const trigger = url.searchParams.get('trigger') ?? '';
  const from = url.searchParams.get('from') ?? '';
  const to = url.searchParams.get('to') ?? '';
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 1),
    100,
  );
  const offset = Math.max(
    parseInt(url.searchParams.get('offset') ?? '0', 10) || 0,
    0,
  );

  const where: Record<string, unknown> = {};
  if ((ALLOWED_JOB as readonly string[]).includes(jobName)) {
    where.jobName = jobName;
  }
  if ((ALLOWED_STATUS as readonly string[]).includes(status)) {
    where.status = status;
  }
  if ((ALLOWED_TRIGGER as readonly string[]).includes(trigger)) {
    where.trigger = trigger;
  }
  if (from || to) {
    const startedAt: Record<string, Date> = {};
    if (from) startedAt.gte = new Date(`${from}T00:00:00`);
    if (to) {
      const d = new Date(`${to}T00:00:00`);
      d.setHours(23, 59, 59, 999);
      startedAt.lte = d;
    }
    where.startedAt = startedAt;
  }

  const [items, total] = await Promise.all([
    prisma.cronRun.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.cronRun.count({ where }),
  ]);

  // Hidratar email del admin que disparó (si existe)
  const userIds = Array.from(
    new Set(
      items
        .map((r) => r.triggeredBy)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const users =
    userIds.length > 0
      ? await prisma.adminUser.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        })
      : [];
  const userMap = new Map(users.map((u) => [u.id, u.email]));

  return NextResponse.json({
    items: items.map((r) => ({
      id: r.id,
      jobName: r.jobName,
      status: r.status,
      trigger: r.trigger,
      triggeredBy: r.triggeredBy,
      triggeredByEmail: r.triggeredBy ? userMap.get(r.triggeredBy) ?? null : null,
      startedAt: r.startedAt.toISOString(),
      finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
      durationMs: r.durationMs,
      metadata: r.metadata ? safeParseJson(r.metadata) : null,
      errorMessage: r.errorMessage,
    })),
    total,
    pagination: { limit, offset },
  });
}

function safeParseJson(s: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(s);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // ignore
  }
  return null;
}
