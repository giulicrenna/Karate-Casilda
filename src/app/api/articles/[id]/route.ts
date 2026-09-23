import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ArticleInputSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { author: { select: { id: true, name: true, photoDriveFileId: true } } },
  });
  if (!article) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  return NextResponse.json(article);
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

  const parsed = ArticleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const author = await prisma.author.findUnique({ where: { id: data.authorId } });
  if (!author) {
    return NextResponse.json({ error: 'Autor no encontrado' }, { status: 400 });
  }

  const updated = await prisma.article.update({
    where: { id: params.id },
    data: {
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      category: data.category,
      coverDriveFileId: data.coverDriveFileId ?? null,
      published: data.published,
      authorId: data.authorId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'update_article',
      entity: 'article',
      entityId: updated.id,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const exists = await prisma.article.findUnique({ where: { id: params.id } });
  if (!exists) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await prisma.article.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'delete_article',
      entity: 'article',
      entityId: params.id,
    },
  });

  return NextResponse.json({ ok: true });
}