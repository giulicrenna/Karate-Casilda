import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import ArticleForm from '@/components/admin/ArticleForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nuevo artículo', robots: { index: false, follow: false } };

export default async function NewArticlePage() {
  await requireAdmin();
  const authors = await prisma.author.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    select: { id: true, name: true, photoDriveFileId: true, active: true },
  });

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Artículos</div>
        <h1 className="font-display text-2xl text-ink-50">Nuevo artículo</h1>
      </header>
      {authors.length === 0 ? (
        <div className="card-minimal p-8">
          <p className="text-sm text-ink-300">
            Necesitás crear al menos un autor antes de publicar artículos.{' '}
            <a href="/admin/autores/nuevo" className="text-shiroi-400 hover:text-shiroi-300 underline">
              Crear autor
            </a>
          </p>
        </div>
      ) : (
        <ArticleForm authors={authors} />
      )}
    </AdminShell>
  );
}