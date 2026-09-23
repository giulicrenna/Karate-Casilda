import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import EventForm from '@/components/admin/EventForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar evento', robots: { index: false, follow: false } };

export default async function EditEventPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) notFound();

  const albums = await prisma.album.findMany({
    where: { OR: [{ event: null }, { event: { id: event.id } }] },
    orderBy: { date: 'desc' },
    select: { id: true, title: true },
  });

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Eventos</div>
        <h1 className="font-display text-2xl text-ink-50">Editar evento</h1>
      </header>
      <EventForm
        albums={albums}
        initial={{
          id: event.id,
          title: event.title,
          slug: event.slug,
          date: event.date.toISOString().slice(0, 16),
          location: event.location,
          description: event.description,
          category: event.category as any,
          coverImage: event.coverImage,
          status: event.status as any,
          featured: event.featured,
          albumId: event.albumId,
        }}
      />
    </AdminShell>
  );
}
