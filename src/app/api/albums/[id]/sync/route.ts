import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { syncFolderCache } from '@/services/google-drive';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const album = await prisma.album.findUnique({ where: { id: params.id } });
  if (!album) return NextResponse.json({ error: 'Álbum no encontrado' }, { status: 404 });

  try {
    const photos = await syncFolderCache(album.driveFolderId, album.id, 1000);
    await prisma.auditLog.create({
      data: {
        userId: s.userId,
        action: 'sync_album',
        entity: 'album',
        entityId: album.id,
        metadata: JSON.stringify({ count: photos.length }),
      },
    });
    return NextResponse.json({ ok: true, count: photos.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
