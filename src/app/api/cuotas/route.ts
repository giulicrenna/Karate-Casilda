import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { FeeRuleSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const rules = await prisma.feeRule.findMany({
    orderBy: [{ active: 'desc' }, { daysPerWeek: 'asc' }, { effectiveFrom: 'desc' }],
  });

  return NextResponse.json(rules);
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

  const parsed = FeeRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const created = await prisma.feeRule.create({
    data: {
      name: data.name,
      daysPerWeek: data.daysPerWeek,
      monthlyAmount: data.monthlyAmount,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
      effectiveUntil: data.effectiveUntil ? new Date(data.effectiveUntil) : null,
      active: data.active,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'create_fee_rule',
      entity: 'fee_rule',
      entityId: created.id,
      metadata: JSON.stringify({
        name: data.name,
        daysPerWeek: data.daysPerWeek,
        monthlyAmount: data.monthlyAmount,
      }),
    },
  });

  return NextResponse.json(created, { status: 201 });
}