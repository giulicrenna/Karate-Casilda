import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import EventCard from '@/components/sections/EventCard';
import SectionHeader from '@/components/sections/SectionHeader';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Eventos',
  description: 'Torneos, exámenes, seminarios y exhibiciones del Dojo Shiroi Ryu.',
};

export default async function EventosPage({
  searchParams,
}: {
  searchParams: { category?: string; status?: string };
}) {
  const where: any = {};
  if (searchParams.category && searchParams.category !== 'all') where.category = searchParams.category;
  if (searchParams.status && searchParams.status !== 'all') where.status = searchParams.status;

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { album: { select: { id: true, slug: true, title: true } } },
  });

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'torneo', label: 'Torneos' },
    { value: 'examen', label: 'Exámenes' },
    { value: 'seminario', label: 'Seminarios' },
    { value: 'exhibicion', label: 'Exhibiciones' },
    { value: 'entrenamiento', label: 'Entrenamientos' },
    { value: 'otro', label: 'Otros' },
  ];

  const statuses = [
    { value: 'all', label: 'Todos' },
    { value: 'upcoming', label: 'Próximos' },
    { value: 'past', label: 'Pasados' },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Agenda del dojo"
        title="Eventos"
        subtitle="Torneos, exámenes, seminarios y exhibiciones."
      />

      <section className="section">
        <SectionHeader
          title="Calendario"
          description="Filtrá por categoría o por estado. Hacé click en cada evento para más detalle."
        />

        {/* Filtros */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-500 uppercase tracking-wider mr-2">Estado:</span>
          {statuses.map((s) => {
            const active = (searchParams.status || 'all') === s.value;
            return (
              <a
                key={s.value}
                href={`/eventos?category=${searchParams.category || 'all'}&status=${s.value}`}
                className={
                  'px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors ' +
                  (active
                    ? 'bg-shiroi-700 text-ink-50'
                    : 'bg-ink-900 text-ink-300 hover:bg-ink-800 hover:text-ink-100')
                }
              >
                {s.label}
              </a>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-500 uppercase tracking-wider mr-2">Categoría:</span>
          {categories.map((c) => {
            const active = (searchParams.category || 'all') === c.value;
            return (
              <a
                key={c.value}
                href={`/eventos?category=${c.value}&status=${searchParams.status || 'all'}`}
                className={
                  'px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors ' +
                  (active
                    ? 'bg-shiroi-700 text-ink-50'
                    : 'bg-ink-900 text-ink-300 hover:bg-ink-800 hover:text-ink-100')
                }
              >
                {c.label}
              </a>
            );
          })}
        </div>

        {events.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-md border border-dashed border-ink-800 p-12 text-center">
            <p className="text-sm text-ink-400">
              No hay eventos para los filtros seleccionados.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="relative isolate overflow-hidden border-b border-ink-900 bg-gradient-to-b from-ink-950 to-ink-950 pt-32 pb-16">
      <div className="absolute inset-0 -z-10 opacity-20" aria-hidden>
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-shiroi-900 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-12 bg-shiroi-600" aria-hidden />
          <span className="eyebrow">{eyebrow}</span>
        </div>
        <h1 className="mt-4 h-section text-balance text-ink-50">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-400">{subtitle}</p>
      </div>
    </header>
  );
}
