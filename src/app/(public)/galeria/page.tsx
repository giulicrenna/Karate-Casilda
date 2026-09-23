import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import AlbumCard from '@/components/sections/AlbumCard';
import SectionHeader from '@/components/sections/SectionHeader';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Galería',
  description: 'Álbumes fotográficos del Dojo Shiroi Ryu. Torneos, exámenes, seminarios y más.',
};

export default async function GaleriaPage() {
  const albums = await prisma.album.findMany({
    where: { published: true },
    orderBy: { date: 'desc' },
  });

  return (
    <>
      <PageHeader
        eyebrow="Archivo visual"
        title="Galería"
        subtitle="Torneos, exámenes, seminarios y momentos del dojo."
      />

      <section className="section">
        <SectionHeader
          title="Álbumes publicados"
          description="Las fotografías se almacenan en Google Drive para mantener este sitio liviano. Cada álbum es una carpeta de Drive; los originales pueden descargarse desde el lightbox."
        />

        {albums.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albums.map((a) => (
              <AlbumCard key={a.id} album={a} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-md border border-dashed border-ink-800 p-12 text-center">
            <p className="text-sm text-ink-400">
              Aún no hay álbumes publicados. Volvé pronto.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="relative isolate overflow-hidden border-b border-ink-900 bg-gradient-to-b from-ink-950 to-ink-950 pt-32 pb-16">
      <div className="absolute inset-0 -z-10 opacity-20" aria-hidden>
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-shiroi-900 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-12 bg-shiroi-600" aria-hidden />
          <span className="eyebrow">{eyebrow}</span>
        </div>
        <h1 className="mt-4 h-section text-balance text-ink-50">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-400">{subtitle}</p>
      </div>
    </header>
  );
}
