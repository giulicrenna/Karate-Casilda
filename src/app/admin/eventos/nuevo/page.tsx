import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import EventForm from '@/components/admin/EventForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nuevo evento', robots: { index: false, follow: false } };

export default async function NewEventPage() {
  await requireAdmin();
  const albums = await prisma.album.findMany({
    where: { event: null },
    orderBy: { date: 'desc' },
    select: { id: true, title: true },
  });

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Eventos</div>
        <h1 className="font-display text-2xl text-ink-50">Nuevo evento</h1>
      </header>
      <EventForm albums={albums} />
    </AdminShell>
  );
}
