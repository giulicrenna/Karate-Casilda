import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import AlumnoRowActions from '@/components/admin/AlumnoRowActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Alumnos', robots: { index: false, follow: false } };

const BELT_LABEL: Record<string, string> = {
  blanca: 'Blanca',
  amarilla: 'Amarilla',
  naranja: 'Naranja',
  verde: 'Verde',
  azul: 'Azul',
  marfil: 'Marfil',
  negra: 'Negra',
};

export default async function AdminAlumnosPage({
  searchParams,
}: {
  searchParams: { q?: string; active?: string; page?: string };
}) {
  await requireAdmin();

  const q = searchParams.q?.trim() ?? '';
  const activeParam = searchParams.active;
  const page = Math.max(parseInt(searchParams.page ?? '1', 10) || 1, 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (activeParam === 'true') where.active = true;
  if (activeParam === 'false') where.active = false;
  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { dni: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: limit,
      skip: offset,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dni: true,
        active: true,
        joinedAt: true,
        profile: { select: { attendanceDaysPerWeek: true, belt: true } },
      },
    }),
    prisma.student.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <AdminShell>
      <header className="flex items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Alumnos</div>
          <h1 className="font-display text-2xl text-ink-50">Gestión de alumnos</h1>
          <p className="mt-1 text-xs text-ink-500">{total} alumno{total === 1 ? '' : 's'}</p>
        </div>
        <Link href="/admin/alumnos/nuevo" className="btn-primary text-xs">
          <Plus className="h-4 w-4" />
          Nuevo alumno
        </Link>
      </header>

      <form className="mb-4 flex flex-wrap gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, email o DNI"
          className="rounded-sm border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-ink-50 placeholder-ink-600 focus:border-shiroi-700 focus:outline-none flex-1 min-w-[200px]"
        />
        <select
          name="active"
          defaultValue={activeParam ?? ''}
          className="rounded-sm border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-ink-50"
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <button type="submit" className="btn-secondary text-xs">
          Buscar
        </button>
      </form>

      {items.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">No hay alumnos que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="hidden md:table-cell px-4 py-3">Email</th>
                <th className="hidden lg:table-cell px-4 py-3">Cinturón</th>
                <th className="hidden lg:table-cell px-4 py-3">Días/sem</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-ink-900/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/alumnos/${s.id}`}
                      className="font-display text-ink-100 hover:text-shiroi-300"
                    >
                      {s.lastName}, {s.firstName}
                    </Link>
                    <div className="text-xs text-ink-500 md:hidden">{s.email}</div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-ink-300">{s.email}</td>
                  <td className="hidden lg:table-cell px-4 py-3 text-ink-400">
                    {s.profile?.belt ? BELT_LABEL[s.profile.belt] ?? s.profile.belt : '—'}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-ink-400">
                    {s.profile?.attendanceDaysPerWeek ?? 2}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
                        (s.active
                          ? 'bg-emerald-900/30 text-emerald-300'
                          : 'bg-ink-800 text-ink-400')
                      }
                    >
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AlumnoRowActions id={s.id} active={s.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
          <div>
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={{
                  pathname: '/admin/alumnos',
                  query: { ...searchParams, page: String(page - 1) },
                }}
                className="btn-secondary text-xs"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={{
                  pathname: '/admin/alumnos',
                  query: { ...searchParams, page: String(page + 1) },
                }}
                className="btn-secondary text-xs"
              >
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}