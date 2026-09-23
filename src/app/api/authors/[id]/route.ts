import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AuthorInputSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const author = await prisma.author.findUnique({
    where: { id: params.id },
    include: { _count: { select: { articles: true } } },
  });
  if (!author) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  return NextResponse.json(author);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = AuthorInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const updated = await prisma.author.update({
    where: { id: params.id },
    data: {
      name: data.name,
      photoDriveFileId: data.photoDriveFileId ?? null,
      active: data.active,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'update_author',
      entity: 'author',
      entityId: updated.id,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const exists = await prisma.author.findUnique({
    where: { id: params.id },
    include: { _count: { select: { articles: true } } },
  });
  if (!exists) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  if (exists._count.articles > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar un autor con artículos asociados. Archiválo en su lugar.' },
      { status: 409 }
    );
  }

  await prisma.author.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'delete_author',
      entity: 'author',
      entityId: params.id,
    },
  });

  return NextResponse.json({ ok: true });
}