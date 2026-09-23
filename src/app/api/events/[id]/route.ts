import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { EventInputSchema } from '@/lib/validation';

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

  const parsed = EventInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const updated = await prisma.event.update({
    where: { id: params.id },
    data: {
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
      userId: s.userId,
      action: 'update_event',
      entity: 'event',
      entityId: updated.id,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  // Desvincular álbum si lo tiene
  const event = await prisma.event.findUnique({ where: { id: params.id }, include: { album: true } });
  if (!event) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  if (event.album) {
    await prisma.event.updateMany({
      where: { albumId: event.album.id },
      data: { albumId: null },
    });
  }

  await prisma.event.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'delete_event',
      entity: 'event',
      entityId: params.id,
    },
  });

  return NextResponse.json({ ok: true });
}
