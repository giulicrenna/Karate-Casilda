import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireRole, SUPERADMIN, SENSEI } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import AdminUserRowActions from '@/components/admin/AdminUserRowActions';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Usuarios admin', robots: { index: false, follow: false } };

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Superadmin',
  sensei: 'Sensei',
  admin: 'Admin',
  editor: 'Editor',
};

export default async function AdminUsuariosPage() {
  const session = await requireRole(SUPERADMIN, SENSEI);

  const users = await prisma.adminUser.findMany({
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return (
    <AdminShell role={session.role}>
      <header className="flex items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Usuarios</div>
          <h1 className="font-display text-2xl text-ink-50">Usuarios administradores</h1>
          <p className="mt-1 text-xs text-ink-500">
            Solo accesible para superadmins y sensei. {users.length} usuario{users.length === 1 ? '' : 's'}.
          </p>
        </div>
        <Link href="/admin/usuarios/nuevo" className="btn-primary text-xs">
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </Link>
      </header>

      {users.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">No hay usuarios administradores.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="hidden md:table-cell px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="hidden sm:table-cell px-4 py-3">Creado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-ink-900/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/usuarios/${u.id}`}
                      className="font-display text-ink-100 hover:text-shiroi-300"
                    >
                      {u.name}
                    </Link>
                    {u.id === session.userId && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-shiroi-500">
                        (vos)
                      </span>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-ink-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
                        (u.role === 'superadmin'
                          ? 'bg-shiroi-900/30 text-shiroi-300'
                          : u.role === 'sensei'
                          ? 'bg-amber-900/30 text-amber-300'
                          : u.role === 'admin'
                          ? 'bg-emerald-900/30 text-emerald-300'
                          : 'bg-ink-800 text-ink-400')
                      }
                    >
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-ink-400">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminUserRowActions id={u.id} name={u.name} isSelf={u.id === session.userId} />
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