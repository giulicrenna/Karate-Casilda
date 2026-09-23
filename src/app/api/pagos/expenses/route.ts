import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ExpenseSchema } from '@/lib/validation';

export const runtime = 'nodejs';

const MAX_LIMIT = 100;

interface ExpenseWhereInput {
  category?: string;
  occurredAt?: { gte?: Date; lte?: Date };
}

export async function GET(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const url = req.nextUrl;
  const category = url.searchParams.get('category');
  const occurredFrom = url.searchParams.get('occurredFrom');
  const occurredTo = url.searchParams.get('occurredTo');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, MAX_LIMIT);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  const where: ExpenseWhereInput = {};
  if (category) where.category = category;
  if (occurredFrom || occurredTo) {
    where.occurredAt = {};
    if (occurredFrom) where.occurredAt.gte = new Date(occurredFrom);
    if (occurredTo) where.occurredAt.lte = new Date(occurredTo);
  }

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.expense.count({ where }),
  ]);

  const serialized = (items as any[]).map((e) => ({
    id: e.id,
    category: e.category,
    description: e.description,
    amount: Number(e.amount),
    occurredAt: e.occurredAt.toISOString(),
    vendor: e.vendor,
    receiptDriveFileId: e.receiptDriveFileId,
    notes: e.notes,
    recordedBy: e.recordedBy,
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

  const parsed = ExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const created = (await prisma.expense.create({
    data: {
      category: data.category,
      description: data.description,
      amount: data.amount,
      occurredAt: new Date(data.occurredAt),
      vendor: data.vendor ?? null,
      receiptDriveFileId: data.receiptDriveFileId ?? null,
      notes: data.notes ?? null,
      recordedBy: s.userId,
    },
  })) as any;

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'create_expense',
      entity: 'expense',
      entityId: created.id,
      metadata: JSON.stringify({
        category: data.category,
        amount: data.amount,
        description: data.description,
      }),
    },
  });

  return NextResponse.json(
    {
      ...created,
      amount: Number(created.amount),
    },
    { status: 201 },
  );
}