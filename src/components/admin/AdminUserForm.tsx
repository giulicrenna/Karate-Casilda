'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save } from 'lucide-react';

interface AdminUserData {
  id?: string;
  email?: string;
  name?: string;
  role?: 'superadmin' | 'admin' | 'editor';
}

interface Props {
  mode: 'create' | 'edit';
  userId?: string;
  initial?: AdminUserData;
}

const ROLES = [
  { value: 'superadmin', label: 'Superadmin' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
];

export default function AdminUserForm({ mode, userId, initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const body: Record<string, unknown> = {
        email: (fd.get('email') as string | null)?.toLowerCase(),
        name: fd.get('name'),
        role: fd.get('role'),
      };

      const password = String(fd.get('password') ?? '').trim();
      if (mode === 'create' || password.length > 0) {
        if (password.length < 10) {
          setError('La contraseña debe tener al menos 10 caracteres.');
          return;
        }
        body.password = password;
      }

      const url = mode === 'create' ? '/api/admin-users' : `/api/admin-users/${userId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({ error: 'Error' }));
      if (!res.ok) {
        setError(data.error || 'No se pudo guardar.');
        return;
      }
      router.push('/admin/usuarios');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
      <div>
        <Field label="Nombre" required>
          <input name="name" required defaultValue={initial?.name} className="input" />
        </Field>
      </div>
      <div>
        <Field label="Email" required>
          <input
            name="email"
            type="email"
            required
            defaultValue={initial?.email}
            className="input"
          />
        </Field>
      </div>
      <div>
        <Field label="Rol" required>
          <select name="role" defaultValue={initial?.role ?? 'admin'} className="input">
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div>
        <Field
          label={mode === 'create' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
          hint="Mínimo 10 caracteres."
          required={mode === 'create'}
        >
          <input
            name="password"
            type="text"
            required={mode === 'create'}
            minLength={10}
            className="input font-mono text-xs"
            placeholder={mode === 'edit' ? 'Dejar vacío para no cambiar' : ''}
          />
        </Field>
      </div>

      {error && (
        <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando…' : mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
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