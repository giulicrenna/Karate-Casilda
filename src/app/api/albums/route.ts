import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AlbumInputSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = AlbumInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  let slug = slugify(data.title);
  let suffix = 0;
  while (await prisma.album.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugify(data.title)}-${suffix}`;
  }

  const created = await prisma.album.create({
    data: {
      slug,
      title: data.title,
      description: data.description ?? null,
      date: new Date(data.date),
      coverImageId: data.coverImageId ?? null,
      driveFolderId: data.driveFolderId,
      driveFolderPath: data.driveFolderPath ?? null,
      photoCount: 0,
      featured: data.featured,
      published: data.published,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'create_album',
      entity: 'album',
      entityId: created.id,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
