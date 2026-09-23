import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ManualPaymentSchema } from '@/lib/validation';
import { recomputeDebtFromPayments } from '@/services/payments/fee-engine';

export const runtime = 'nodejs';

const MAX_LIMIT = 100;

interface PaymentWhereInput {
  studentId?: string;
  status?: string;
  method?: string;
  debtId?: string;
}

export async function GET(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const url = req.nextUrl;
  const studentId = url.searchParams.get('studentId');
  const status = url.searchParams.get('status');
  const method = url.searchParams.get('method');
  const debtId = url.searchParams.get('debtId');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, MAX_LIMIT);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  const where: PaymentWhereInput = {};
  if (studentId) where.studentId = studentId;
  if (status) where.status = status;
  if (method) where.method = method;
  if (debtId) where.debtId = debtId;

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        debt: { select: { id: true, periodYear: true, periodMonth: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.payment.count({ where }),
  ]);

  const serialized = (items as any[]).map((p) => ({
    id: p.id,
    studentId: p.studentId,
    studentName: `${p.student.firstName} ${p.student.lastName}`.trim(),
    debtId: p.debtId,
    debtPeriod:
      p.debt ? `${p.debt.periodYear}-${String(p.debt.periodMonth).padStart(2, '0')}` : null,
    amount: Number(p.amount),
    currency: p.currency,
    method: p.method,
    status: p.status,
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    mpPaymentId: p.mpPaymentId,
    mpPreferenceId: p.mpPreferenceId,
    receiptUrl: p.receiptUrl,
  }));

  return NextResponse.json({ items: serialized, total, limit, offset });
}

export async function POST(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = ManualPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const debt = (await prisma.debt.findUnique({ where: { id: data.debtId } })) as any;
  if (!debt) return NextResponse.json({ error: 'Deuda no encontrada' }, { status: 404 });
  if (debt.status === 'cancelled') {
    return NextResponse.json({ error: 'La deuda está cancelada' }, { status: 400 });
  }

  const paidAt = data.paidAt ? new Date(data.paidAt) : new Date();

  const payment = (await prisma.payment.create({
    data: {
      studentId: debt.studentId,
      debtId: debt.id,
      amount: data.amount,
      currency: 'ARS',
      method: data.method,
      status: 'approved',
      paidAt,
      metadata: JSON.stringify({ notes: data.notes ?? null, recordedBy: s.userId }),
    },
  })) as any;

  const newStatus = await recomputeDebtFromPayments(debt.id);

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'manual_payment',
      entity: 'payment',
      entityId: payment.id,
      metadata: JSON.stringify({
        debtId: debt.id,
        amount: data.amount,
        method: data.method,
        newDebtStatus: newStatus,
      }),
    },
  });

  return NextResponse.json(
    {
      ...payment,
      amount: Number(payment.amount),
    },
    { status: 201 },
  );
}