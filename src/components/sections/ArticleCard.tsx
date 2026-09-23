import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import CategoryChip from '@/components/article/CategoryChip';
import AuthorBadge from '@/components/article/AuthorBadge';

interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    coverDriveFileId: string | null;
    publishedAt: Date | string;
    author: { name: string; photoDriveFileId: string | null };
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/articulos/${article.slug}`}
      className="group card-minimal flex flex-col overflow-hidden"
    >
      {article.coverDriveFileId && (
        <div className="relative aspect-[16/9] overflow-hidden bg-ink-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/thumb/${encodeURIComponent(article.coverDriveFileId)}?size=800`}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <CategoryChip category={article.category} />
          <div className="flex items-center gap-1.5 text-xs text-ink-400">
            <Calendar className="h-3.5 w-3.5 text-shiroi-600" />
            <time dateTime={new Date(article.publishedAt).toISOString()}>
              {formatDate(article.publishedAt)}
            </time>
          </div>
        </div>
        <h3 className="mt-3 font-display text-lg leading-tight text-ink-100 group-hover:text-shiroi-400 transition-colors text-balance">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-ink-400 text-pretty">{article.excerpt}</p>
        <div className="mt-4 pt-4 border-t border-ink-900">
          <AuthorBadge author={article.author} size="sm" />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-shiroi-500">
          <span className="uppercase tracking-wider">Leer artículo</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}