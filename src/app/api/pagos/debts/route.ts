import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

const MAX_LIMIT = 100;

interface DebtWhereInput {
  periodYear?: number;
  periodMonth?: number;
  status?: string;
  studentId?: string;
}

export async function GET(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const url = req.nextUrl;
  const periodYear = url.searchParams.get('periodYear');
  const periodMonth = url.searchParams.get('periodMonth');
  const status = url.searchParams.get('status');
  const studentId = url.searchParams.get('studentId');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, MAX_LIMIT);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  const where: DebtWhereInput = {};
  if (periodYear) where.periodYear = parseInt(periodYear, 10);
  if (periodMonth) where.periodMonth = parseInt(periodMonth, 10);
  if (status) where.status = status;
  if (studentId) where.studentId = studentId;

  const [items, total] = await Promise.all([
    prisma.debt.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }, { student: { lastName: 'asc' } }],
      take: limit,
      skip: offset,
    }),
    prisma.debt.count({ where }),
  ]);

  const serialized = (items as any[]).map((d) => ({
    id: d.id,
    studentId: d.studentId,
    studentName: `${d.student.firstName} ${d.student.lastName}`.trim(),
    periodYear: d.periodYear,
    periodMonth: d.periodMonth,
    baseAmount: Number(d.baseAmount),
    surchargeAmount: Number(d.surchargeAmount),
    manualAdjustment: Number(d.manualAdjustment),
    totalAmount: Number(d.totalAmount),
    paidAmount: Number(d.paidAmount),
    balance: Number(d.totalAmount) - Number(d.paidAmount),
    dueDate: d.dueDate.toISOString(),
    status: d.status,
    manualNote: d.manualNote,
    notes: d.notes,
  }));

  return NextResponse.json({ items: serialized, total, limit, offset });
}