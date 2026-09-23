import Link from 'next/link';
import { Calendar, Images, Users, BarChart3, LogOut, FileText, Camera } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import LogoutButton from '@/components/admin/LogoutButton';
import { googleDriveConfigured } from '@/services/google-drive';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const session = await requireAdmin();

  const [eventCount, albumCount, photoCount, upcomingEvents, recentAlbums, driveConfigured] = await Promise.all([
    prisma.event.count(),
    prisma.album.count(),
    prisma.drivePhotoCache.count(),
    prisma.event.findMany({
      where: { status: 'upcoming' },
      orderBy: { date: 'asc' },
      take: 5,
    }),
    prisma.album.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    googleDriveConfigured(),
  ]);

  return (
    <AdminShell>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Panel</div>
          <h1 className="font-display text-2xl text-ink-50">Dashboard</h1>
          <p className="mt-1 text-xs text-ink-500">
            Sesión iniciada como <strong>{session.email}</strong>
          </p>
        </div>
        <LogoutButton />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Calendar className="h-5 w-5" />} label="Eventos" value={eventCount} href="/admin/eventos" />
        <StatCard icon={<Images className="h-5 w-5" />} label="Álbumes" value={albumCount} href="/admin/albumes" />
        <StatCard icon={<Camera className="h-5 w-5" />} label="Fotos en caché" value={photoCount} />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Google Drive"
          value={driveConfigured ? 'OK' : 'No configurado'}
          valueClass={driveConfigured ? 'text-emerald-400' : 'text-shiroi-400'}
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Próximos eventos" href="/admin/eventos" linkLabel="Ver todos">
          {upcomingEvents.length === 0 ? (
            <Empty text="No hay eventos próximos." />
          ) : (
            <ul className="divide-y divide-ink-900">
              {upcomingEvents.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-display text-sm text-ink-100 truncate">{ev.title}</div>
                    <div className="text-xs text-ink-500">
                      {new Date(ev.date).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · {ev.category}
                    </div>
                  </div>
                  <Link
                    href={`/admin/eventos/${ev.id}`}
                    className="text-xs text-shiroi-400 hover:text-shiroi-300 whitespace-nowrap"
                  >
                    Editar →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Álbumes recientes" href="/admin/albumes" linkLabel="Ver todos">
          {recentAlbums.length === 0 ? (
            <Empty text="Aún no hay álbumes." />
          ) : (
            <ul className="divide-y divide-ink-900">
              {recentAlbums.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-display text-sm text-ink-100 truncate">{a.title}</div>
                    <div className="text-xs text-ink-500">
                      {a.photoCount} fotos ·{' '}
                      {new Date(a.date).toLocaleDateString('es-AR', { dateStyle: 'short' })}
                    </div>
                  </div>
                  <Link
                    href={`/admin/albumes/${a.id}`}
                    className="text-xs text-shiroi-400 hover:text-shiroi-300 whitespace-nowrap"
                  >
                    Editar →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickAction
          href="/admin/eventos/nuevo"
          icon={<Calendar className="h-4 w-4" />}
          title="Crear evento"
          desc="Torneo, examen, seminario."
        />
        <QuickAction
          href="/admin/albumes/nuevo"
          icon={<Images className="h-4 w-4" />}
          title="Crear álbum"
          desc="Asociá una carpeta de Drive."
        />
        <QuickAction
          href="/admin/contenido"
          icon={<FileText className="h-4 w-4" />}
          title="Editar contenido"
          desc="Textos del sitio, contacto."
        />
      </div>
    </AdminShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  valueClass = 'text-ink-50',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href?: string;
  valueClass?: string;
}) {
  const content = (
    <div className="card-minimal p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">{label}</div>
        <div className="text-shiroi-600">{icon}</div>
      </div>
      <div className={`mt-3 font-display text-3xl ${valueClass}`}>{value}</div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function Panel({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-minimal p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-base text-ink-100">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-shiroi-400 hover:text-shiroi-300">
            {linkLabel} →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="py-6 text-center text-xs text-ink-500">{text}</div>;
}

function QuickAction({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="card-minimal p-5 flex items-center gap-3 hover:border-shiroi-700"
    >
      <div className="grid h-9 w-9 place-items-center rounded-sm bg-shiroi-900/30 text-shiroi-400">
        {icon}
      </div>
      <div>
        <div className="font-display text-sm text-ink-100">{title}</div>
        <div className="text-xs text-ink-500">{desc}</div>
      </div>
    </Link>
  );
}
