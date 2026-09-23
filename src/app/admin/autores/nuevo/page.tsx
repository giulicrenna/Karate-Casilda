import { requireAdmin } from '@/lib/guards';
import AdminShell from '@/components/admin/AdminShell';
import AuthorForm from '@/components/admin/AuthorForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nuevo autor', robots: { index: false, follow: false } };

export default async function NewAuthorPage() {
  await requireAdmin();

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Autores</div>
        <h1 className="font-display text-2xl text-ink-50">Nuevo autor</h1>
      </header>
      <AuthorForm />
    </AdminShell>
  );
}