'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Trash2, Upload } from 'lucide-react';

interface Props {
  initialConfigured: boolean;
  initialClientEmail: string | null;
  initialProjectId: string | null;
}

export default function GoogleDriveConfigForm({
  initialConfigured,
  initialClientEmail,
  initialProjectId,
}: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [configured, setConfigured] = useState(initialConfigured);
  const [clientEmail, setClientEmail] = useState(initialClientEmail);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch('/api/admin/integrations/google-drive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar');
      setConfigured(true);
      setClientEmail(json.client_email ?? null);
      setProjectId(json.project_id ?? null);
      setMsg({ type: 'ok', text: 'Credenciales guardadas. La galería ya puede sincronizar.' });
      router.refresh();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error desconocido' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar las credenciales de Google Drive? La galería dejará de sincronizar.')) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/integrations/google-drive', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al eliminar');
      }
      setConfigured(false);
      setClientEmail(null);
      setProjectId(null);
      setMsg({ type: 'ok', text: 'Credenciales eliminadas.' });
      router.refresh();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error desconocido' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {configured ? (
        <div className="rounded-md border border-emerald-900/60 bg-emerald-950/20 p-4 text-sm">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <strong>Configurado</strong>
          </div>
          {clientEmail && (
            <div className="mt-2 text-xs text-ink-300 break-all">
              <span className="text-ink-500">client_email:</span> {clientEmail}
            </div>
          )}
          {projectId && (
            <div className="text-xs text-ink-300 break-all">
              <span className="text-ink-500">project_id:</span> {projectId}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-ink-800 p-4 text-sm text-ink-400">
          No hay credenciales cargadas.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm border border-shiroi-700 bg-shiroi-900/30 px-4 py-2 text-sm text-shiroi-200 hover:bg-shiroi-900/50 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {configured ? 'Reemplazar JSON' : 'Subir JSON'}
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
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {msg && (
        <div
          className={`text-sm ${
            msg.type === 'ok' ? 'text-emerald-300' : 'text-shiroi-400'
          }`}
        >
          {msg.text}
        </div>
      )}

      <details className="text-xs text-ink-500">
        <summary className="cursor-pointer hover:text-ink-300">Cómo obtener el JSON</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Google Cloud Console → IAM & Admin → Service Accounts → Create</li>
          <li>Click en la cuenta → tab Keys → Add Key → Create new key → JSON</li>
          <li>Compartí cada carpeta de Drive con el <code>client_email</code> del archivo (Viewer)</li>
        </ol>
      </details>
    </div>
  );
}
