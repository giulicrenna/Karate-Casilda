'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Save, Trash2 } from 'lucide-react';

interface Props {
  initialConfigured: boolean;
  initialEnvironment: 'sandbox' | 'production' | null;
  initialPublicKey: string | null;
}

export default function MercadoPagoConfig({
  initialConfigured,
  initialEnvironment,
  initialPublicKey,
}: Props) {
  const router = useRouter();
  const [configured, setConfigured] = useState(initialConfigured);
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>(
    initialEnvironment ?? 'sandbox',
  );
  const [publicKey, setPublicKey] = useState(initialPublicKey ?? '');
  const [accessToken, setAccessToken] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body: Record<string, string> = { environment, publicKey };
      // Si ya está configurado y los campos están vacíos, mantenemos los anteriores
      // enviando los vacíos igual (no permitimos "vaciar" sin tocar el endpoint).
      if (accessToken) body.accessToken = accessToken;
      else if (!configured) body.accessToken = '';
      if (webhookSecret) body.webhookSecret = webhookSecret;
      else if (!configured) body.webhookSecret = '';

      // Si está configurado y el admin no completa los secretos, debemos
      // enviar los existentes. Como no los tenemos, exigimos que los pegue.
      if (configured && (!accessToken || !webhookSecret)) {
        throw new Error(
          'Para reemplazar las credenciales pegá todas (accessToken, publicKey, webhookSecret).',
        );
      }

      const res = await fetch('/api/admin/integrations/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar');
      }
      setConfigured(true);
      setAccessToken('');
      setWebhookSecret('');
      setMsg({ type: 'ok', text: 'Credenciales de Mercado Pago guardadas.' });
      router.refresh();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar las credenciales de Mercado Pago? Los pagos online dejarán de funcionar.')) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/integrations/mercadopago', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      setConfigured(false);
      setAccessToken('');
      setWebhookSecret('');
      setMsg({ type: 'ok', text: 'Credenciales eliminadas.' });
      router.refresh();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {configured ? (
        <div className="rounded-md border border-emerald-900/60 bg-emerald-950/20 p-4 text-sm">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <strong>Configurado</strong>
          </div>
          <div className="mt-2 text-xs text-ink-300">
            Entorno: <span className="font-mono">{environment}</span>
          </div>
          {publicKey && (
            <div className="text-xs text-ink-400 break-all">
              <span className="text-ink-500">publicKey:</span> {publicKey}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-ink-800 p-4 text-sm text-ink-400">
          No hay credenciales cargadas.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500">
            Entorno
          </label>
          <select
            value={environment}
            onChange={(e) =>
              setEnvironment(e.target.value as 'sandbox' | 'production')
            }
            className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50"
          >
            <option value="sandbox">Sandbox (pruebas)</option>
            <option value="production">Producción</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500">
            Public key
          </label>
          <input
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            required
            placeholder="APP_USR-..."
            className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase tracking-wider text-ink-500">
            Access token{' '}
            {configured && <span className="text-ink-600">(pegá para reemplazar)</span>}
          </label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            required={!configured}
            placeholder="APP_USR-..."
            className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase tracking-wider text-ink-500">
            Webhook secret{' '}
            {configured && <span className="text-ink-600">(pegá para reemplazar)</span>}
          </label>
          <input
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            required={!configured}
            placeholder="(configurado en tu panel de MP)"
            className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm bg-shiroi-700 px-4 py-2 text-sm font-semibold text-ink-50 hover:bg-shiroi-600 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {configured ? 'Reemplazar' : 'Guardar'}
        </button>
        {configured && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-sm border border-ink-800 px-4 py-2 text-sm text-ink-300 hover:bg-ink-900 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        )}
      </div>

      {msg && (
        <p
          className={`text-sm ${msg.type === 'ok' ? 'text-emerald-300' : 'text-shiroi-400'}`}
          role="alert"
        >
          {msg.text}
        </p>
      )}

      <details className="text-xs text-ink-500">
        <summary className="cursor-pointer hover:text-ink-300">Cómo obtener las credenciales</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Crear una cuenta en mercadopago.com (test en sandbox.mercadopago.com).</li>
          <li>Tu integración → Credenciales: copiá el access_token y public_key.</li>
          <li>Webhook secret: configurá una URL de notificación y tomá la clave generada.</li>
          <li>Apuntá el webhook a <code>/api/pagos/webhooks/mercadopago</code>.</li>
        </ol>
      </details>
    </form>
  );
}
