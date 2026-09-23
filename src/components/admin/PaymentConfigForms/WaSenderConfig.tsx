'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Save, Trash2 } from 'lucide-react';

interface Props {
  initialConfigured: boolean;
}

export default function WaSenderConfig({ initialConfigured }: Props) {
  const router = useRouter();
  const [configured, setConfigured] = useState(initialConfigured);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (configured && !apiKey) {
        throw new Error('Pegá la API key para reemplazar.');
      }
      const body: Record<string, string> = { apiKey };
      if (baseUrl) body.baseUrl = baseUrl;
      if (phoneNumber) body.phoneNumber = phoneNumber;

      const res = await fetch('/api/admin/integrations/wasender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar');
      }
      setConfigured(true);
      setApiKey('');
      setMsg({ type: 'ok', text: 'Credenciales de WaSender guardadas.' });
      router.refresh();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar las credenciales de WaSender? No se podrán enviar más WhatsApps automáticos.')) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/integrations/wasender', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      setConfigured(false);
      setApiKey('');
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
          <p className="mt-1 text-xs text-ink-400">
            API key almacenada de forma cifrada. Pegá una nueva para reemplazar.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-ink-800 p-4 text-sm text-ink-400">
          No hay credenciales cargadas.
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500">
            API key{' '}
            {configured && <span className="text-ink-600">(pegá para reemplazar)</span>}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required={!configured}
            placeholder="••••••••••••"
            className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500">
            Base URL (opcional)
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://www.wasenderapi.com"
            className="mt-1 w-full rounded-sm border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600"
          />
          <p className="mt-1 text-[10px] text-ink-500">
            Si tenés una URL personalizada, pegala acá. Si no, dejala en blanco.
          </p>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-ink-500">
            Número remitente (informativo)
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+5493464123456"
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
        <summary className="cursor-pointer hover:text-ink-300">Cómo obtener la API key</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Crear cuenta en wasenderapi.com y conectar el número del dojo.</li>
          <li>Panel → API Keys: crear nueva key y copiarla.</li>
          <li>Pegala arriba (solo se guarda cifrada en la base).</li>
        </ol>
      </details>
    </form>
  );
}
