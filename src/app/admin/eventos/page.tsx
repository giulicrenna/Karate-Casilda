import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import { formatDate } from '@/lib/utils';
import EventRowActions from '@/components/admin/EventRowActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Eventos', robots: { index: false, follow: false } };

export default async function AdminEventosPage() {
  await requireAdmin();
  const events = await prisma.event.findMany({ orderBy: { date: 'desc' } });

  return (
    <AdminShell>
      <header className="flex items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Eventos</div>
          <h1 className="font-display text-2xl text-ink-50">Gestión de eventos</h1>
        </div>
        <Link href="/admin/eventos/nuevo" className="btn-primary text-xs">
          <Plus className="h-4 w-4" />
          Nuevo evento
        </Link>
      </header>

      {events.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="text-sm text-ink-400">No hay eventos todavía.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="hidden sm:table-cell px-4 py-3">Fecha</th>
                <th className="hidden md:table-cell px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-ink-900/30">
                  <td className="px-4 py-3">
                    <div className="font-display text-ink-100">{ev.title}</div>
                    <div className="text-xs text-ink-500 sm:hidden">
                      {formatDate(ev.date)}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-ink-300">
                    {formatDate(ev.date)}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-ink-400">
                    {ev.category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
                        (ev.status === 'upcoming'
                          ? 'bg-emerald-900/30 text-emerald-300'
                          : ev.status === 'past'
                          ? 'bg-ink-800 text-ink-400'
                          : 'bg-shiroi-900/30 text-shiroi-300')
                      }
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <EventRowActions id={ev.id} title={ev.title} />
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
