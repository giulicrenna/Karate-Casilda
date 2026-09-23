import Link from 'next/link';
import { ArrowRight, Images, Quote } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getManyContent } from '@/lib/utils';
import Hero from '@/components/sections/Hero';
import SectionHeader from '@/components/sections/SectionHeader';
import AlbumCard from '@/components/sections/AlbumCard';
import { getCachedAlbumPhotos } from '@/services/google-drive';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    content,
    featuredAlbums,
    recentAlbums,
  ] = await Promise.all([
    getManyContent([
      'home.hero.title',
      'home.hero.subtitle',
      'home.hero.tagline',
      'home.hero.description',
      'home.values.title',
      'dojo.shortName',
    ]),
    prisma.album.findMany({
      where: { featured: true, published: true },
      orderBy: { date: 'desc' },
      take: 3,
    }),
    prisma.album.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 4,
    }),
  ]);

  const featuredAlbumForGallery = featuredAlbums[0];
  let galleryPhotos: Awaited<ReturnType<typeof getCachedAlbumPhotos>> = [];
  if (featuredAlbumForGallery) {
    try {
      galleryPhotos = (await getCachedAlbumPhotos(featuredAlbumForGallery.id)).slice(0, 8);
    } catch {
      galleryPhotos = [];
    }
  }

  const hero = {
    title: content['home.hero.title'] || 'Karate Casilda',
    subtitle: content['home.hero.subtitle'] || 'Dojo Shiroi Ryu',
    tagline: content['home.hero.tagline'] || 'Tradición, disciplina y respeto.',
    description:
      content['home.hero.description'] ||
      'Un dojo de karate tradicional Shotokan donde se cultivan el carácter, la técnica y la comunidad.',
  };

  return (
    <>
      <Hero
        title={hero.title}
        subtitle={hero.subtitle}
        tagline={hero.tagline}
        description={hero.description}
      />

      {/* Cita */}
      <section className="section-tight">
        <figure className="mx-auto max-w-3xl text-center">
          <Quote className="mx-auto h-8 w-8 text-shiroi-700" aria-hidden />
          <blockquote className="mt-6 font-display text-2xl italic leading-relaxed text-ink-100 sm:text-3xl">
            «El espíritu del karate es como el agua: si está tranquilo, refleja; si hierve, se
            derrite.»
          </blockquote>
          <figcaption className="mt-4 text-sm uppercase tracking-[0.2em] text-ink-400">
            Gichin Funakoshi
          </figcaption>
        </figure>
      </section>

      {/* Valores */}
      <section className="section">
        <SectionHeader
          eyebrow="Principios"
          title={content['home.values.title'] || 'Nuestros valores'}
          description="Cinco principios que guían cada clase, cada saludo y cada decisión dentro y fuera del dojo."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { kanji: '礼', word: 'Respeto', desc: 'El karate comienza y termina con la cortesía.' },
            { kanji: '誠', word: 'Sinceridad', desc: 'Makoto, el camino verdadero.' },
            { kanji: '努', word: 'Esfuerzo', desc: 'Doryoku, el espíritu de mejora constante.' },
            { kanji: '克', word: 'Autocontrol', desc: 'Kekki no yū, dominio de los impulsos.' },
            { kanji: '人', word: 'Carácter', desc: 'Jinkaku, la búsqueda del carácter.' },
          ].map((v) => (
            <div
              key={v.word}
              className="card-minimal p-6 text-center"
            >
              <div
                className="font-display text-5xl text-shiroi-600 mb-3"
                aria-hidden
              >
                {v.kanji}
              </div>
              <h3 className="font-display text-lg text-ink-100">{v.word}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-400">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Galería destacada */}
      {featuredAlbumForGallery && (
        <section className="section">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <SectionHeader
              eyebrow="Galería"
              title="Último álbum destacado"
              description={featuredAlbumForGallery.title}
              as="div"
            />
            <Link
              href={`/galeria/${featuredAlbumForGallery.slug}`}
              className="btn-ghost text-xs whitespace-nowrap"
            >
              Ver álbum completo
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {galleryPhotos.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {galleryPhotos.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/galeria/${featuredAlbumForGallery.slug}#foto-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-sm bg-ink-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnailUrl ?? ''}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider text-ink-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.name}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-md border border-dashed border-ink-800 p-10 text-center">
              <Images className="mx-auto h-8 w-8 text-ink-600" />
              <p className="mt-4 text-sm text-ink-400">
                Este álbum aún no tiene fotografías sincronizadas.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Últimos álbumes */}
      <section className="section-tight">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <SectionHeader
            eyebrow="Archivo"
            title="Álbumes recientes"
            as="div"
          />
          <Link href="/galeria" className="btn-ghost text-xs whitespace-nowrap">
            Toda la galería
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentAlbums.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentAlbums.map((a) => (
              <AlbumCard key={a.id} album={a} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-ink-500">Sin álbumes publicados.</p>
        )}
      </section>
    </>
  );
}
