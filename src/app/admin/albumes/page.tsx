import Link from 'next/link';
import { Plus, RefreshCcw } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import { formatDate } from '@/lib/utils';
import AlbumRowActions from '@/components/admin/AlbumRowActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Álbumes', robots: { index: false, follow: false } };

export default async function AdminAlbumesPage() {
  await requireAdmin();
  const albums = await prisma.album.findMany({
    orderBy: { date: 'desc' },
    include: { event: { select: { title: true, slug: true } } },
  });

  return (
    <AdminShell>
      <header className="flex items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Álbumes</div>
          <h1 className="font-display text-2xl text-ink-50">Gestión de álbumes</h1>
          <p className="mt-1 text-xs text-ink-500">
            Las fotos se almacenan en Google Drive. Solo asociá la carpeta correcta.
          </p>
        </div>
        <Link href="/admin/albumes/nuevo" className="btn-primary text-xs">
          <Plus className="h-4 w-4" />
          Nuevo álbum
        </Link>
      </header>

      {albums.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">No hay álbumes todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {albums.map((a) => (
            <article key={a.id} className="card-minimal p-4 flex gap-4">
              <div className="relative h-24 w-24 flex-none overflow-hidden rounded-sm bg-ink-900">
                {a.coverImageId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://drive.google.com/thumbnail?id=${a.coverImageId}&sz=w300`}
                    alt={a.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-700 text-xs">
                    {a.photoCount} fotos
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-sm text-ink-100 truncate">{a.title}</h3>
                  {a.featured && (
                    <span className="text-[10px] uppercase tracking-wider text-shiroi-500">
                      Destacado
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-ink-500">
                  {formatDate(a.date)} · {a.photoCount} fotos
                </div>
                {a.driveFolderPath && (
                  <div className="mt-1 truncate text-[11px] text-ink-600">
                    📁 {a.driveFolderPath}
                  </div>
                )}
                {a.event && (
                  <div className="mt-1 text-[11px] text-shiroi-400 truncate">
                    Evento: {a.event.title}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href={`/galeria/${a.slug}`}
                    target="_blank"
                    className="text-[11px] text-ink-400 hover:text-shiroi-400"
                  >
                    Ver público ↗
                  </Link>
                  <AlbumRowActions id={a.id} title={a.title} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
