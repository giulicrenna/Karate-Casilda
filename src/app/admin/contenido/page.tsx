import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import ContentEditor from '@/components/admin/ContentEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contenido', robots: { index: false, follow: false } };

export default async function ContenidoPage() {
  await requireAdmin();
  const content = await prisma.siteContent.findMany({ orderBy: { key: 'asc' } });

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Contenido</div>
        <h1 className="font-display text-2xl text-ink-50">Editor de contenido</h1>
        <p className="mt-1 text-xs text-ink-500">
          Editá los textos que aparecen en el sitio público. Guardá cada bloque con su propio
          botón.
        </p>
      </header>

      <ContentEditor items={content} />
    </AdminShell>
  );
}
