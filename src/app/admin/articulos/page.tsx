import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import { formatDate } from '@/lib/utils';
import { ARTICLE_CATEGORY_LABELS } from '@/lib/constants';
import ArticleRowActions from '@/components/admin/ArticleRowActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Artículos', robots: { index: false, follow: false } };

export default async function AdminArticulosPage() {
  await requireAdmin();
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { id: true, name: true } } },
  });

  return (
    <AdminShell>
      <header className="flex items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Artículos</div>
          <h1 className="font-display text-2xl text-ink-50">Gestión de artículos</h1>
        </div>
        <Link href="/admin/articulos/nuevo" className="btn-primary text-xs">
          <Plus className="h-4 w-4" />
          Nuevo artículo
        </Link>
      </header>

      {articles.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">No hay artículos todavía.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="hidden md:table-cell px-4 py-3">Autor</th>
                <th className="hidden sm:table-cell px-4 py-3">Categoría</th>
                <th className="hidden sm:table-cell px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Publicado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-ink-900/30">
                  <td className="px-4 py-3">
                    <div className="font-display text-ink-100">{a.title}</div>
                    <div className="text-xs text-ink-500 md:hidden">
                      {a.author.name} · {formatDate(a.publishedAt)}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-ink-300">{a.author.name}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-ink-400">
                    {ARTICLE_CATEGORY_LABELS[a.category] ?? a.category}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-ink-300">
                    {formatDate(a.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
                        (a.published
                          ? 'bg-emerald-900/30 text-emerald-300'
                          : 'bg-ink-800 text-ink-400')
                      }
                    >
                      {a.published ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ArticleRowActions id={a.id} title={a.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}