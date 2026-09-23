import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { EventInputSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

async function requireAdminOrJson() {
  const s = await getAdminSession();
  if (!s) {
    return { session: null as any, error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  }
  return { session: s, error: null };
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

  const parsed = EventInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Generar slug único
  let slug = slugify(data.title);
  let suffix = 0;
  while (await prisma.event.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugify(data.title)}-${suffix}`;
  }

  const created = await prisma.event.create({
    data: {
      slug,
      title: data.title,
      date: new Date(data.date),
      location: data.location ?? null,
      description: data.description,
      category: data.category,
      coverImage: data.coverImage ?? null,
      status: data.status,
      featured: data.featured,
      albumId: data.albumId ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'create_event',
      entity: 'event',
      entityId: created.id,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
