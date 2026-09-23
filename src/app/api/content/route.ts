import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ContentUpdateSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = ContentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.siteContent.upsert({
    where: { key: parsed.data.key },
    update: { value: parsed.data.value },
    create: { key: parsed.data.key, value: parsed.data.value },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'update_content',
      entity: 'content',
      entityId: updated.id,
      metadata: JSON.stringify({ key: parsed.data.key }),
    },
  });

  return NextResponse.json(updated);
}
