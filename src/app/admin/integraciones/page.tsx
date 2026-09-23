import { requireAdmin } from '@/lib/guards';
import { getServiceAccountCredentials } from '@/lib/google-credentials';
import AdminShell from '@/components/admin/AdminShell';
import GoogleDriveConfigForm from '@/components/admin/GoogleDriveConfigForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Integraciones', robots: { index: false, follow: false } };

export default async function IntegrationsPage() {
  await requireAdmin();
  const creds = await getServiceAccountCredentials();

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Panel</div>
        <h1 className="font-display text-2xl text-ink-50">Integraciones</h1>
        <p className="mt-1 text-xs text-ink-500">
          Credenciales cifradas en la base de datos. Se renuevan al subir un nuevo archivo.
        </p>
      </header>

      <section className="card-minimal p-6 max-w-2xl">
        <h2 className="font-display text-lg text-ink-50">Google Drive</h2>
        <p className="mt-1 text-sm text-ink-400">
          Service Account que lee las carpetas de los álbumes. Compartí cada carpeta con el email
          de la cuenta (campo <code>client_email</code> del JSON) con permiso <strong>Viewer</strong>.
        </p>

        <div className="mt-5">
          <GoogleDriveConfigForm
            initialConfigured={!!creds}
            initialClientEmail={creds?.client_email ?? null}
            initialProjectId={creds?.project_id ?? null}
          />
        </div>
      </section>
    </AdminShell>
  );
}
