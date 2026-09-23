import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import ArticleForm from '@/components/admin/ArticleForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar artículo', robots: { index: false, follow: false } };

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const [article, authors] = await Promise.all([
    prisma.article.findUnique({ where: { id: params.id } }),
    prisma.author.findMany({
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
      select: { id: true, name: true, photoDriveFileId: true, active: true },
    }),
  ]);

  if (!article) notFound();

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Artículos</div>
        <h1 className="font-display text-2xl text-ink-50">Editar artículo</h1>
      </header>
      <ArticleForm
        authors={authors}
        initial={{
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          category: article.category,
          coverDriveFileId: article.coverDriveFileId,
          published: article.published,
          authorId: article.authorId,
        }}
      />
    </AdminShell>
  );
}