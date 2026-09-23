import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Calendar, Images } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getCachedAlbumPhotos } from '@/services/google-drive';
import { formatDate } from '@/lib/utils';
import GalleryGrid from '@/components/gallery/GalleryGrid';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const album = await prisma.album.findUnique({ where: { slug: params.slug } });
  if (!album) return { title: 'Álbum no encontrado' };
  return {
    title: album.title,
    description: album.description || `Álbum fotográfico: ${album.title}`,
  };
}

export default async function AlbumPage({ params }: { params: { slug: string } }) {
  const album = await prisma.album.findUnique({ where: { slug: params.slug } });
  if (!album || !album.published) notFound();

  let photos: Awaited<ReturnType<typeof getCachedAlbumPhotos>> = [];
  let syncError: string | null = null;
  try {
    photos = await getCachedAlbumPhotos(album.id);
  } catch (err) {
    syncError = err instanceof Error ? err.message : 'Error desconocido';
  }

  return (
    <>
      <header className="relative isolate overflow-hidden border-b border-ink-900 bg-gradient-to-b from-ink-950 to-ink-950 pt-32 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/galeria"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ink-400 hover:text-shiroi-400 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Galería
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px w-12 bg-shiroi-600" aria-hidden />
            <span className="eyebrow">Álbum</span>
          </div>

          <h1 className="mt-4 h-section text-balance text-ink-50">{album.title}</h1>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-shiroi-600" />
              <time dateTime={new Date(album.date).toISOString()}>
                {formatDate(album.date)}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-shiroi-600" />
              <span>{album.photoCount} fotografías</span>
            </div>
          </div>

          {album.description && (
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-ink-300">
              {album.description}
            </p>
          )}
        </div>
      </header>

      <section className="section">
        {syncError ? (
          <div className="rounded-md border border-shiroi-900/40 bg-shiroi-950/20 p-6 text-sm text-ink-300">
            <strong className="text-shiroi-400">Aviso:</strong>{' '}
            No se pudieron sincronizar las fotografías. Verificá que las credenciales de Google
            Drive estén configuradas correctamente. Error: {syncError}
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-md border border-dashed border-ink-800 p-12 text-center">
            <p className="text-sm text-ink-400">
              Este álbum aún no tiene fotografías. Las fotos aparecerán aquí cuando el
              administrador sincronice la carpeta de Google Drive.
            </p>
          </div>
        ) : (
          <GalleryGrid photos={photos} albumTitle={album.title} />
        )}
      </section>
    </>
  );
}
