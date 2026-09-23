import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AuthorInputSchema } from '@/lib/validation';
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

  const authors = await prisma.author.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { articles: true } } },
  });
  return NextResponse.json(authors);
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

  const parsed = AuthorInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Generar slug único
  let slug = slugify(data.name);
  let suffix = 0;
  while (await prisma.author.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugify(data.name)}-${suffix}`;
  }

  const created = await prisma.author.create({
    data: {
      slug,
      name: data.name,
      photoDriveFileId: data.photoDriveFileId ?? null,
      active: data.active,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'create_author',
      entity: 'author',
      entityId: created.id,
    },
  });

  return NextResponse.json(created, { status: 201 });
}