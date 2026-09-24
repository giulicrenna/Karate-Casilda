import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { IncomeUpdateSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const income = await prisma.income.findUnique({ where: { id: params.id } });
  if (!income) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({
    ...income,
    amount: Number(income.amount),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = IncomeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.income.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const updated = await prisma.income.update({
    where: { id: params.id },
    data: {
      category: data.category ?? existing.category,
      description: data.description ?? existing.description,
      amount: data.amount ?? Number(existing.amount),
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : existing.occurredAt,
      source: data.source === undefined ? existing.source : data.source ?? null,
      method: data.method ?? existing.method,
      receiptDriveFileId:
        data.receiptDriveFileId === undefined
          ? existing.receiptDriveFileId
          : data.receiptDriveFileId ?? null,
      notes: data.notes === undefined ? existing.notes : data.notes ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'update_income',
      entity: 'income',
      entityId: updated.id,
      metadata: JSON.stringify({ changes: data }),
    },
  });

  return NextResponse.json({
    ...updated,
    amount: Number(updated.amount),
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const existing = await prisma.income.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await prisma.income.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'delete_income',
      entity: 'income',
      entityId: params.id,
      metadata: JSON.stringify({
        category: existing.category,
        amount: Number(existing.amount),
      }),
    },
  });

  return NextResponse.json({ ok: true });
}
