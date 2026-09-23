import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ArticleInputSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

async function requireAdminOrJson() {
  const s = await getAdminSession();
  if (!s) {
    return { session: null as any, error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  }
  return { session: s, error: null };
}

export async function GET() {
  const { session, error } = await requireAdminOrJson();
  if (error) return error;

  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { id: true, name: true, photoDriveFileId: true } } },
  });
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdminOrJson();
  if (error) return error;

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

  // Generar slug único
  let slug = slugify(data.title);
  let suffix = 0;
  while (await prisma.article.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugify(data.title)}-${suffix}`;
  }

  const created = await prisma.article.create({
    data: {
      slug,
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
      userId: session.userId,
      action: 'create_article',
      entity: 'article',
      entityId: created.id,
    },
  });

  return NextResponse.json(created, { status: 201 });
}