import { getStudentSession } from '@/lib/auth-student';
import PortalShell from '@/components/alumno/PortalShell';
import PasswordChangeForm from '@/components/alumno/PasswordChangeForm';

export const dynamic = 'force-dynamic';

export default async function AlumnoCambiarPasswordPage() {
  const session = await getStudentSession();
  // Permitimos la página incluso sin sesión activa para que el admin pueda restablecer
  // (en este caso, el endpoint /api/student/me/password devolverá 401). Pero el caso
  // habitual es que el alumno esté logueado y deba cambiar la contraseña.
  return (
    <PortalShell email={session?.email} mustChangePwd={true} hideNav={!session}>
      <header className="border-b border-ink-800 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Portal del alumno</div>
        <h1 className="font-display text-2xl text-ink-50">Cambiar contraseña</h1>
        <p className="mt-1 text-xs text-ink-500">
          {session?.mustChangePwd
            ? 'Por seguridad, establecé una nueva contraseña antes de continuar.'
            : 'Actualizá tu contraseña periódicamente para mantener tu cuenta segura.'}
        </p>
      </header>
      <PasswordChangeForm forced={session?.mustChangePwd ?? false} />
    </PortalShell>
  );
}