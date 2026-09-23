import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import AuthorRowActions from '@/components/admin/AuthorRowActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Autores', robots: { index: false, follow: false } };

export default async function AdminAutoresPage() {
  await requireAdmin();
  const authors = await prisma.author.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { articles: true } } },
  });

  return (
    <AdminShell>
      <header className="flex items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Autores</div>
          <h1 className="font-display text-2xl text-ink-50">Gestión de autores</h1>
        </div>
        <Link href="/admin/autores/nuevo" className="btn-primary text-xs">
          <Plus className="h-4 w-4" />
          Nuevo autor
        </Link>
      </header>

      {authors.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">No hay autores todavía.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="hidden sm:table-cell px-4 py-3">Slug</th>
                <th className="hidden sm:table-cell px-4 py-3">Artículos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {authors.map((a) => (
                <tr key={a.id} className="hover:bg-ink-900/30">
                  <td className="px-4 py-3">
                    {a.photoDriveFileId ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={`/api/thumb/${encodeURIComponent(a.photoDriveFileId)}?size=80`}
                        alt={a.name}
                        className="h-10 w-10 rounded-full object-cover border border-ink-800"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-ink-800 grid place-items-center text-xs text-shiroi-400 font-display">
                        {a.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-display text-ink-100">{a.name}</div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 font-mono text-xs text-ink-400">
                    {a.slug}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-ink-300">
                    {a._count.articles}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
                        (a.active
                          ? 'bg-emerald-900/30 text-emerald-300'
                          : 'bg-ink-800 text-ink-400')
                      }
                    >
                      {a.active ? 'Activo' : 'Archivado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AuthorRowActions
                      id={a.id}
                      name={a.name}
                      active={a.active}
                      articleCount={a._count.articles}
                    />
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