import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import AuthorForm from '@/components/admin/AuthorForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar autor', robots: { index: false, follow: false } };

export default async function EditAuthorPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const author = await prisma.author.findUnique({ where: { id: params.id } });
  if (!author) notFound();

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Autores</div>
        <h1 className="font-display text-2xl text-ink-50">Editar autor</h1>
      </header>
      <AuthorForm
        initial={{
          id: author.id,
          name: author.name,
          photoDriveFileId: author.photoDriveFileId,
          active: author.active,
        }}
      />
    </AdminShell>
  );
}