import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import AlbumForm from '@/components/admin/AlbumForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nuevo álbum', robots: { index: false, follow: false } };

export default async function NewAlbumPage() {
  await requireAdmin();
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    select: { id: true, title: true },
  });

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Álbumes</div>
        <h1 className="font-display text-2xl text-ink-50">Nuevo álbum</h1>
        <p className="mt-1 text-xs text-ink-500">
          Para crear un álbum necesitás el ID de la carpeta de Google Drive que contiene las
          fotografías. Ver{' '}
          <a
            href="https://support.google.com/drive/answer/2494822"
            target="_blank"
            rel="noreferrer"
            className="text-shiroi-400 hover:underline"
          >
            cómo obtenerlo
          </a>
          .
        </p>
      </header>
      <AlbumForm events={events} />
    </AdminShell>
  );
}
