import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AlbumInputSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

  const updated = await prisma.album.update({
    where: { id: params.id },
    data: {
      title: data.title,
      description: data.description ?? null,
      date: new Date(data.date),
      coverImageId: data.coverImageId ?? null,
      driveFolderId: data.driveFolderId,
      driveFolderPath: data.driveFolderPath ?? null,
      featured: data.featured,
      published: data.published,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'update_album',
      entity: 'album',
      entityId: updated.id,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const album = await prisma.album.findUnique({ where: { id: params.id } });
  if (!album) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  // Borrar fotos en caché del álbum
  await prisma.drivePhotoCache.deleteMany({ where: { albumId: params.id } });

  // Desvincular del evento si lo tiene
  await prisma.event.updateMany({
    where: { albumId: params.id },
    data: { albumId: null },
  });

  await prisma.album.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'delete_album',
      entity: 'album',
      entityId: params.id,
    },
  });

  return NextResponse.json({ ok: true });
}
