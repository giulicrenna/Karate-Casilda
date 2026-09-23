'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save } from 'lucide-react';

interface Props {
  forced?: boolean;
}

export default function PasswordChangeForm({ forced }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setOk(false);

    const fd = new FormData(e.currentTarget);
    const currentPassword = String(fd.get('currentPassword') ?? '');
    const newPassword = String(fd.get('newPassword') ?? '');
    const confirm = String(fd.get('confirm') ?? '');

    if (newPassword !== confirm) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/student/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({ error: 'Error' }));
      if (!res.ok) {
        setError(data.error || 'No se pudo cambiar la contraseña.');
        return;
      }
      setOk(true);
      router.push('/alumno');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-md">
      {forced && (
        <div className="rounded-sm border border-shiroi-900/60 bg-shiroi-950/40 px-4 py-3 text-xs text-shiroi-300">
          Por seguridad, cambiá tu contraseña antes de continuar.
        </div>
      )}

      <Field label="Contraseña actual" required>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </Field>

      <Field
        label="Nueva contraseña"
        required
        hint="Mínimo 10 caracteres, con mayúscula, minúscula y al menos un dígito."
      >
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          className="input"
        />
      </Field>

      <Field label="Confirmar nueva contraseña" required>
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          className="input"
        />
      </Field>

      {error && (
        <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-sm border border-emerald-900/60 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-300">
          Contraseña actualizada.
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.125rem;
          border: 1px solid rgb(38 38 38);
          background-color: rgb(10 10 10 / 0.6);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(245 245 245);
        }
        :global(.input:focus) {
          border-color: rgb(185 28 28);
          outline: none;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
        {label} {required && <span className="text-shiroi-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-500">{hint}</p>}
    </div>
  );
}