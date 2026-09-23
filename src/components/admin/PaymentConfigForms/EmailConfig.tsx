'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Save, Trash2 } from 'lucide-react';

interface Props {
  initialConfigured: boolean;
  initialProvider: 'resend' | 'smtp' | null;
  initialFromAddress: string | null;
  initialFromName: string | null;
}

export default function EmailConfig({
  initialConfigured,
  initialProvider,
  initialFromAddress,
  initialFromName,
}: Props) {
  const router = useRouter();
  const [configured, setConfigured] = useState(initialConfigured);
  const [provider, setProvider] = useState<'resend' | 'smtp'>(
    initialProvider ?? 'resend',
  );
  const [resendApiKey, setResendApiKey] = useState('');
  const [fromAddress, setFromAddress] = useState(initialFromAddress ?? '');
  const [fromName, setFromName] = useState(initialFromName ?? '');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (!fromAddress) {
        throw new Error('El campo "From address" es obligatorio.');
      }
      if (provider === 'resend' && !configured && !resendApiKey) {
        throw new Error('Pegá la API key de Resend.');
      }
      if (configured && provider === 'resend' && !resendApiKey) {
        throw new Error('Pegá una API key para reemplazar.');
      }

      const body: Record<string, string | number> = {
        provider,
        fromAddress,
      };
      if (fromName) body.fromName = fromName;
      if (resendApiKey) body.resendApiKey = resendApiKey;
      if (smtpHost) body.smtpHost = smtpHost;
      if (smtpPort) body.smtpPort = Number(smtpPort);
      if (smtpUser) body.smtpUser = smtpUser;
      if (smtpPass) body.smtpPass = smtpPass;

      const res = await fetch('/api/admin/integrations/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar');
      }
      setConfigured(true);
      setResendApiKey('');
      setMsg({ type: 'ok', text: 'Credenciales de email guardadas.' });
      router.refresh();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar las credenciales de email? No se podrán enviar más emails automáticos.')) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/integrations/email', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      setConfigured(false);
      setResendApiKey('');
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
          <p className="mt-1 text-xs text-ink-300">
            Provider: <span className="font-mono">{provider}</span>{' '}
            {initialFromAddress && (
              <>
                · From: <span className="font-mono">{initialFromAddress}</span>
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-ink-800 p-4 text-sm text-ink-400">
          No hay credenciales cargadas.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500">
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'resend' | 'smtp')}
            className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50"
          >
            <option value="resend">Resend (recomendado)</option>
            <option value="smtp">SMTP (no soportado aún)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500">
            From address
          </label>
          <input
            type="email"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            required
            placeholder="no-reply@karatecasilda.local"
            className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase tracking-wider text-ink-500">
            From name (opcional)
          </label>
          <input
            type="text"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Dojo Shiroi Ryu"
            className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600"
          />
        </div>

        {provider === 'resend' && (
          <div className="sm:col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-ink-500">
              Resend API key{' '}
              {configured && <span className="text-ink-600">(pegá para reemplazar)</span>}
            </label>
            <input
              type="password"
              value={resendApiKey}
              onChange={(e) => setResendApiKey(e.target.value)}
              required={!configured}
              placeholder="re_..."
              className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600"
            />
          </div>
        )}

        {provider === 'smtp' && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-ink-500">
                Host
              </label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.example.com"
                className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-ink-500">
                Puerto
              </label>
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-ink-500">
                Usuario
              </label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-ink-500">
                Contraseña
              </label>
              <input
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50"
              />
            </div>
          </>
        )}
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
    </form>
  );
}
