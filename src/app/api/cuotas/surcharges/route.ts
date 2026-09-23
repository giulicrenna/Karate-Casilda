import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { LateSurchargeRuleSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const rules = await prisma.lateSurchargeRule.findMany({
    orderBy: [{ active: 'desc' }, { effectiveFrom: 'desc' }],
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

  const parsed = LateSurchargeRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const created = await prisma.lateSurchargeRule.create({
    data: {
      name: data.name,
      graceDays: data.graceDays,
      surchargePct: data.surchargePct,
      active: data.active,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
      effectiveUntil: data.effectiveUntil ? new Date(data.effectiveUntil) : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'create_surcharge_rule',
      entity: 'surcharge_rule',
      entityId: created.id,
      metadata: JSON.stringify({
        name: data.name,
        graceDays: data.graceDays,
        surchargePct: data.surchargePct,
      }),
    },
  });

  return NextResponse.json(created, { status: 201 });
}