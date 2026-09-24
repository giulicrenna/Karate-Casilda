import { notFound } from 'next/navigation';
import { requireRole, SUPERADMIN, SENSEI } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import AdminUserForm from '@/components/admin/AdminUserForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar usuario', robots: { index: false, follow: false } };

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const session = await requireRole(SUPERADMIN, SENSEI);

  const user = await prisma.adminUser.findUnique({ where: { id: params.id } });
  if (!user) notFound();

  return (
    <AdminShell role={session.role}>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">
          Usuarios · {user.name}
        </div>
        <h1 className="font-display text-2xl text-ink-50">Editar usuario</h1>
      </header>
      <AdminUserForm
        mode="edit"
        userId={user.id}
        initial={{
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as 'superadmin' | 'sensei' | 'admin' | 'editor',
        }}
      />
    </AdminShell>
  );
}