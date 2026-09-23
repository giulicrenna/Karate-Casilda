import { requireAdmin } from '@/lib/guards';
import { getServiceAccountCredentials } from '@/lib/google-credentials';
import {
  getMercadoPagoCredentials,
} from '@/lib/credentials/mercadopago';
import {
  getWaSenderCredentials,
} from '@/lib/credentials/wasender';
import {
  getEmailCredentials,
} from '@/lib/credentials/email';
import AdminShell from '@/components/admin/AdminShell';
import GoogleDriveConfigForm from '@/components/admin/GoogleDriveConfigForm';
import PaymentConfigFormsTabs from '@/components/admin/PaymentConfigForms';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Integraciones', robots: { index: false, follow: false } };

export default async function IntegrationsPage() {
  await requireAdmin();

  // Cargamos las 4 integraciones en paralelo.
  const [gdCreds, mpCreds, wsCreds, emCreds] = await Promise.all([
    getServiceAccountCredentials(),
    getMercadoPagoCredentials(),
    getWaSenderCredentials(),
    getEmailCredentials(),
  ]);

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Panel</div>
        <h1 className="font-display text-2xl text-ink-50">Integraciones</h1>
        <p className="mt-1 text-xs text-ink-500">
          Credenciales cifradas en la base de datos. Se renuevan al subir o pegar nuevas.
        </p>
      </header>

      {/* Pagos + notificaciones */}
      <section className="card-minimal p-6 mb-6 max-w-3xl">
        <h2 className="font-display text-lg text-ink-50">Pagos y notificaciones</h2>
        <p className="mt-1 text-sm text-ink-400">
          Credenciales para la pasarela de pagos (Mercado Pago), WhatsApp (WaSender) y
          email (Resend / SMTP).
        </p>

        <div className="mt-5">
          <PaymentConfigFormsTabs
            mp={{
              configured: !!mpCreds,
              environment: mpCreds?.environment,
              publicKey: mpCreds?.publicKey ?? null,
            }}
            wasender={{ configured: !!wsCreds }}
            email={{
              configured: !!emCreds,
              provider: emCreds?.provider,
              fromAddress: emCreds?.fromAddress ?? null,
              fromName: emCreds?.fromName ?? null,
            }}
          />
        </div>
      </section>

      {/* Google Drive */}
      <section className="card-minimal p-6 max-w-2xl">
        <h2 className="font-display text-lg text-ink-50">Google Drive</h2>
        <p className="mt-1 text-sm text-ink-400">
          Service Account que lee las carpetas de los álbumes. Compartí cada carpeta con
          el email de la cuenta (campo <code>client_email</code> del JSON) con permiso{' '}
          <strong>Viewer</strong>.
        </p>

        <div className="mt-5">
          <GoogleDriveConfigForm
            initialConfigured={!!gdCreds}
            initialClientEmail={gdCreds?.client_email ?? null}
            initialProjectId={gdCreds?.project_id ?? null}
          />
        </div>
      </section>
    </AdminShell>
  );
}
