import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Calendar } from 'lucide-react';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { SITE_CONFIG } from '@/lib/site';
import ArticleBody from '@/components/article/ArticleBody';
import CategoryChip from '@/components/article/CategoryChip';
import AuthorBadge from '@/components/article/AuthorBadge';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true, photoDriveFileId: true } } },
  });
  if (!article || !article.published) return { title: 'Artículo no encontrado' };

  const description = article.excerpt.slice(0, 160);
  const ogImage = article.coverDriveFileId
    ? `${SITE_CONFIG.url}/api/thumb/${encodeURIComponent(article.coverDriveFileId)}?size=1600`
    : undefined;

  return {
    title: article.title,
    description,
    authors: [{ name: article.author.name }],
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url: `${SITE_CONFIG.url}/articulos/${article.slug}`,
      images: ogImage ? [ogImage] : undefined,
      publishedTime: article.publishedAt.toISOString(),
      authors: [article.author.name],
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { id: true, name: true, photoDriveFileId: true } } },
  });

  if (!article || !article.published) notFound();

  return (
    <article className="pt-32 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/articulos"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ink-400 hover:text-shiroi-400 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Todos los artículos
        </Link>

        <div className="mt-6">
          <CategoryChip category={article.category} />
        </div>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl text-ink-50 text-balance">
          {article.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-300">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-shiroi-600" />
            <time dateTime={new Date(article.publishedAt).toISOString()}>
              {formatDate(article.publishedAt)}
            </time>
          </div>
          <AuthorBadge author={article.author} size="md" />
        </div>

        {article.coverDriveFileId && (
          <div className="mt-8 overflow-hidden rounded-md border border-ink-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/thumb/${encodeURIComponent(article.coverDriveFileId)}?size=1600`}
              alt={article.title}
              className="w-full"
            />
          </div>
        )}

        {article.excerpt && (
          <p className="mt-8 text-lg leading-relaxed text-ink-300 text-pretty border-l-2 border-shiroi-700 pl-4 italic">
            {article.excerpt}
          </p>
        )}

        <div className="mt-10">
          <ArticleBody source={article.body} />
        </div>

        <div className="mt-16 border-t border-ink-900 pt-8 flex items-center justify-between">
          <div className="text-xs text-ink-500">
            Por <span className="text-ink-200">{article.author.name}</span> ·{' '}
            <time dateTime={new Date(article.publishedAt).toISOString()}>
              {formatDate(article.publishedAt)}
            </time>
          </div>
          <Link href="/articulos" className="text-xs uppercase tracking-wider text-shiroi-500 hover:text-shiroi-400">
            ← Volver a artículos
          </Link>
        </div>
      </div>
    </article>
  );
}