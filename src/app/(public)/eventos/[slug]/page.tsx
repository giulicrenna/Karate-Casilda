import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Calendar, MapPin, Images, Trophy } from 'lucide-react';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { SITE_CONFIG } from '@/lib/site';
import SafeImage from '@/components/ui/SafeImage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const event = await prisma.event.findUnique({ where: { slug: params.slug } });
  if (!event) return { title: 'Evento no encontrado' };
  const description = event.description.slice(0, 160);
  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      type: 'article',
      url: `${SITE_CONFIG.url}/eventos/${event.slug}`,
      images: event.coverImage ? [event.coverImage] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: { album: true },
  });

  if (!event) notFound();

  return (
    <>
      <article className="pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ink-400 hover:text-shiroi-400 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Todos los eventos
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px w-12 bg-shiroi-600" aria-hidden />
            <span className="eyebrow">{event.category}</span>
            {event.featured && (
              <span className="ml-2 inline-block rounded-sm bg-shiroi-900/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-shiroi-300">
                Destacado
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl sm:text-4xl text-ink-50 text-balance">
            {event.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-shiroi-600" />
              <time dateTime={new Date(event.date).toISOString()}>
                {formatDate(event.date, { withTime: true })}
              </time>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-shiroi-600" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {event.coverImage && (
            <div className="mt-8 overflow-hidden rounded-md border border-ink-800">
              <SafeImage
                src={event.coverImage}
                alt={event.title}
                fallbackIcon={<Trophy className="h-16 w-16 text-shiroi-700/40" aria-hidden />}
                className="w-full"
              />
            </div>
          )}

          <div className="prose-custom mt-10 text-base leading-relaxed text-ink-200 whitespace-pre-wrap">
            {event.description}
          </div>

          {event.album && (
            <div className="mt-12 rounded-md border border-shiroi-900/40 bg-shiroi-950/20 p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="eyebrow">Álbum asociado</div>
                <h3 className="mt-1 font-display text-lg text-ink-100">{event.album.title}</h3>
                <p className="mt-1 text-xs text-ink-400">
                  {event.album.photoCount} fotografías disponibles
                </p>
              </div>
              <Link
                href={`/galeria/${event.album.slug}`}
                className="btn-primary text-xs"
              >
                <Images className="h-4 w-4" />
                Ver galería
              </Link>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
