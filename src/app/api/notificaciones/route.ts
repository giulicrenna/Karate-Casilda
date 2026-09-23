// /api/notificaciones — listado paginado y filtrable de NotificationLog.
// Solo accesible para administradores autenticados.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_CHANNELS = ['email', 'whatsapp'] as const;
const ALLOWED_STATUS = ['sent', 'failed', 'skipped', 'pending'] as const;
const ALLOWED_TEMPLATES = [
  'payment_received',
  'payment_received_admin',
  'due_reminder',
  'overdue_notice',
  'welcome',
  'password_reset',
] as const;

export async function GET(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const url = new URL(req.url);
  const channel = url.searchParams.get('channel') ?? '';
  const status = url.searchParams.get('status') ?? '';
  const template = url.searchParams.get('template') ?? '';
  const studentId = url.searchParams.get('studentId') ?? '';
  const debtId = url.searchParams.get('debtId') ?? '';
  const dateFrom = url.searchParams.get('dateFrom') ?? '';
  const dateTo = url.searchParams.get('dateTo') ?? '';
  const q = url.searchParams.get('q')?.trim() ?? '';
  const limit = Math.min(
    parseInt(url.searchParams.get('limit') ?? '50', 10) || 50,
    200,
  );
  const offset = Math.max(
    parseInt(url.searchParams.get('offset') ?? '0', 10) || 0,
    0,
  );

  const where: Record<string, unknown> = {};
  if ((ALLOWED_CHANNELS as readonly string[]).includes(channel)) {
    where.channel = channel;
  }
  if ((ALLOWED_STATUS as readonly string[]).includes(status)) {
    where.status = status;
  }
  if ((ALLOWED_TEMPLATES as readonly string[]).includes(template)) {
    where.template = template;
  }
  if (studentId) where.relatedStudentId = studentId;
  if (debtId) where.relatedDebtId = debtId;
  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      createdAt.lte = d;
    }
    where.createdAt = createdAt;
  }
  if (q) {
    where.recipient = { contains: q, mode: 'insensitive' };
  }

  const [items, total, byChannel, byStatus] = await Promise.all([
    prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        debt: {
          select: {
            id: true,
            periodYear: true,
            periodMonth: true,
            status: true,
            student: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    }),
    prisma.notificationLog.count({ where }),
    prisma.notificationLog.groupBy({
      by: ['channel'],
      where,
      _count: { _all: true },
    }),
    prisma.notificationLog.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    }),
  ]);

  return NextResponse.json({
    items,
    total,
    facets: {
      channels: byChannel,
      statuses: byStatus,
    },
    pagination: { limit, offset },
  });
}