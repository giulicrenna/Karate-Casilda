import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { FeeRuleSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const rule = await prisma.feeRule.findUnique({ where: { id: params.id } });
  if (!rule) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(rule);
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

  const parsed = FeeRuleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.feeRule.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const updated = await prisma.feeRule.update({
    where: { id: params.id },
    data: {
      name: data.name ?? existing.name,
      daysPerWeek: data.daysPerWeek ?? existing.daysPerWeek,
      monthlyAmount: data.monthlyAmount ?? existing.monthlyAmount,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : existing.effectiveFrom,
      effectiveUntil:
        data.effectiveUntil === undefined
          ? existing.effectiveUntil
          : data.effectiveUntil
          ? new Date(data.effectiveUntil)
          : null,
      active: data.active ?? existing.active,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'update_fee_rule',
      entity: 'fee_rule',
      entityId: updated.id,
      metadata: JSON.stringify({ changes: data }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const existing = await prisma.feeRule.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  // Soft delete: desactivar.
  await prisma.feeRule.update({
    where: { id: params.id },
    data: { active: false },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'deactivate_fee_rule',
      entity: 'fee_rule',
      entityId: params.id,
      metadata: JSON.stringify({ name: existing.name }),
    },
  });

  return NextResponse.json({ ok: true });
}