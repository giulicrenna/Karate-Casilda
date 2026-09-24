import { requireRole, SUPERADMIN, SENSEI } from '@/lib/guards';
import AdminShell from '@/components/admin/AdminShell';
import AdminUserForm from '@/components/admin/AdminUserForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nuevo usuario', robots: { index: false, follow: false } };

export default async function NuevoUsuarioPage() {
  const session = await requireRole(SUPERADMIN, SENSEI);

  return (
    <AdminShell role={session.role}>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Usuarios</div>
        <h1 className="font-display text-2xl text-ink-50">Nuevo usuario administrador</h1>
      </header>
      <AdminUserForm mode="create" />
    </AdminShell>
  );
}