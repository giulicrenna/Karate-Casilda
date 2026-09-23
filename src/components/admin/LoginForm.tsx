'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error desconocido' }));
        setError(data.error || 'No se pudo iniciar sesión.');
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Error de red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-ink-800 bg-ink-950/90 backdrop-blur-md p-6 shadow-2xl"
    >
      <div>
        <label htmlFor="email" className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-sm border border-ink-800 bg-ink-900 px-3 py-2.5 text-sm text-ink-50 placeholder-ink-600 focus:border-shiroi-700 focus:outline-none"
          placeholder="admin@karatecasilda.local"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="password" className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-sm border border-ink-800 bg-ink-900 px-3 py-2.5 text-sm text-ink-50 placeholder-ink-600 focus:border-shiroi-700 focus:outline-none"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
        <Lock className="h-4 w-4" />
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}
