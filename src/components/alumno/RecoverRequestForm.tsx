'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function RecoverRequestForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/student-recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No se pudo procesar la solicitud.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Error de red.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-md border border-emerald-900/60 bg-emerald-950/20 p-6 text-sm text-emerald-300">
        Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña
        en los próximos minutos. Revisá también la carpeta de correo no deseado.
      </div>
    );
  }

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
          placeholder="tu@email.com"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
        <Mail className="h-4 w-4" />
        {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
      </button>
    </form>
  );
}