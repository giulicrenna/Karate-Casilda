import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import AlbumForm from '@/components/admin/AlbumForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar álbum', robots: { index: false, follow: false } };

export default async function EditAlbumPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const album = await prisma.album.findUnique({ where: { id: params.id } });
  if (!album) notFound();

  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    select: { id: true, title: true },
  });

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Álbumes</div>
        <h1 className="font-display text-2xl text-ink-50">Editar álbum</h1>
      </header>
      <AlbumForm
        events={events}
        initial={{
          id: album.id,
          title: album.title,
          slug: album.slug,
          description: album.description,
          date: album.date.toISOString().slice(0, 10),
          driveFolderId: album.driveFolderId,
          driveFolderPath: album.driveFolderPath,
          coverImageId: album.coverImageId,
          featured: album.featured,
          published: album.published,
        }}
      />
    </AdminShell>
  );
}
