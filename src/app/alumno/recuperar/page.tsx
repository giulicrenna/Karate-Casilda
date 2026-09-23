import { Suspense } from 'react';
import RecoverRequestForm from '@/components/alumno/RecoverRequestForm';
import ResetPasswordForm from '@/components/alumno/ResetPasswordForm';

export const dynamic = 'force-dynamic';

function ResetPasswordFormWrapped() {
  return <ResetPasswordForm />;
}

export default async function AlumnoRecuperarPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-shiroi p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-sm border border-shiroi-700 bg-ink-950 font-display text-3xl text-shiroi-500">
            空
          </div>
          <h1 className="mt-4 font-display text-2xl text-ink-50">
            {token ? 'Nueva contraseña' : 'Recuperar contraseña'}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-shiroi-500">
            Dojo Shiroi Ryu
          </p>
        </div>
        {token ? (
          <Suspense fallback={<p className="text-xs text-ink-400">Cargando…</p>}>
            <ResetPasswordFormWrapped />
          </Suspense>
        ) : (
          <RecoverRequestForm />
        )}
      </div>
    </div>
  );
}