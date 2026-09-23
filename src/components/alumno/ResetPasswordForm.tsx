'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const newPassword = String(fd.get('newPassword') ?? '');
    const confirm = String(fd.get('confirm') ?? '');

    if (newPassword !== confirm) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }
    if (!token) {
      setError('Token de recuperación faltante.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/student-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => ({ error: 'Error' }));
      if (!res.ok) {
        setError(data.error || 'No se pudo restablecer la contraseña.');
        return;
      }
      router.push('/alumno');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-md border border-shiroi-900/40 bg-shiroi-950/40 p-6 text-sm text-shiroi-300">
        El enlace de recuperación es inválido. Solicitá uno nuevo desde la pantalla de recuperación.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-ink-800 bg-ink-950/90 backdrop-blur-md p-6 shadow-2xl"
    >
      <Field label="Nueva contraseña" hint="Mínimo 10 caracteres, con mayúscula, minúscula y al menos un dígito.">
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          className="w-full rounded-sm border border-ink-800 bg-ink-900 px-3 py-2.5 text-sm text-ink-50 focus:border-shiroi-700 focus:outline-none"
        />
      </Field>
      <div className="mt-4">
        <Field label="Confirmar contraseña">
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            className="w-full rounded-sm border border-ink-800 bg-ink-900 px-3 py-2.5 text-sm text-ink-50 focus:border-shiroi-700 focus:outline-none"
          />
        </Field>
      </div>

      {error && (
        <p className="mt-4 rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-primary mt-6 w-full">
        <Save className="h-4 w-4" />
        {saving ? 'Guardando…' : 'Restablecer contraseña'}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-500">{hint}</p>}
    </div>
  );
}