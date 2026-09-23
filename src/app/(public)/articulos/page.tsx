import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import ArticleCard from '@/components/sections/ArticleCard';
import { ARTICLE_CATEGORIES } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Artículos',
  description: 'Notas, anuncios y reflexiones del Dojo Shiroi Ryu.',
};

const PAGE_SIZE = 12;

export default async function ArticulosPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const cat = searchParams.category && searchParams.category !== 'all' ? searchParams.category : null;

  const where = {
    published: true,
    ...(cat ? { category: cat } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { author: { select: { name: true, photoDriveFileId: true } } },
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filters = [
    { value: 'all', label: 'Todas' },
    ...ARTICLE_CATEGORIES.map((c) => ({ value: c.id, label: c.label })),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Cuaderno del dojo"
        title="Artículos"
        subtitle="Notas, anuncios y reflexiones del Dojo Shiroi Ryu."
      />

      <section className="section">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-500 uppercase tracking-wider mr-2">Categoría:</span>
          {filters.map((f) => {
            const active = (cat ?? 'all') === f.value;
            const href =
              f.value === 'all'
                ? `/articulos${page > 1 ? `?page=${page}` : ''}`
                : `/articulos?category=${f.value}${page > 1 ? `&page=${page}` : ''}`;
            return (
              <a
                key={f.value}
                href={href}
                className={
                  'px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors ' +
                  (active
                    ? 'bg-shiroi-700 text-ink-50'
                    : 'bg-ink-900 text-ink-300 hover:bg-ink-800 hover:text-ink-100')
                }
              >
                {f.label}
              </a>
            );
          })}
        </div>

        {articles.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-md border border-dashed border-ink-800 p-12 text-center">
            <p className="text-sm text-ink-400">
              {cat
                ? 'No hay artículos en esta categoría por ahora.'
                : 'Todavía no hay artículos publicados.'}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
            {page > 1 && (
              <a
                href={`/articulos?${cat ? `category=${cat}&` : ''}page=${page - 1}`}
                className="px-3 py-1.5 rounded-sm bg-ink-900 text-ink-300 hover:bg-ink-800"
              >
                ← Anterior
              </a>
            )}
            <span className="text-ink-400">
              Página {page} de {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={`/articulos?${cat ? `category=${cat}&` : ''}page=${page + 1}`}
                className="px-3 py-1.5 rounded-sm bg-ink-900 text-ink-300 hover:bg-ink-800"
              >
                Siguiente →
              </a>
            )}
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