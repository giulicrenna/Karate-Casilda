import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, UserCircle, LogIn } from 'lucide-react';
import { getAdminSession } from '@/lib/auth';
import { getStudentSession } from '@/lib/auth-student';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Iniciar sesión',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Auto-detección: si ya hay sesión, redirigir al panel correspondiente
  const adminSession = await getAdminSession();
  if (adminSession) {
    redirect('/admin/dashboard');
  }
  const studentSession = await getStudentSession();
  if (studentSession) {
    redirect(studentSession.mustChangePwd ? '/alumno/cambiar-password' : '/alumno');
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-sm border border-shiroi-700 bg-ink-900 text-shiroi-500 mb-4">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="font-display text-3xl text-ink-50">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-ink-400">
            Elegí el tipo de cuenta con la que querés ingresar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/login"
            className="card-minimal p-6 hover:border-shiroi-700 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-10 w-10 place-items-center rounded-sm bg-shiroi-900/30 text-shiroi-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="font-display text-lg text-ink-50">Administrador</h2>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">
              Acceso para senseis y miembros del dojo que gestionan alumnos, pagos, eventos e integraciones.
            </p>
            <div className="mt-4 text-xs text-shiroi-400 group-hover:text-shiroi-300">
              Ingresar como admin →
            </div>
          </Link>

          <Link
            href="/alumno/login"
            className="card-minimal p-6 hover:border-shiroi-700 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-10 w-10 place-items-center rounded-sm bg-shiroi-900/30 text-shiroi-400">
                <UserCircle className="h-5 w-5" />
              </div>
              <h2 className="font-display text-lg text-ink-50">Alumno</h2>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">
              Acceso para alumnos del dojo: perfil, certificados, deudas y pagos mensuales.
            </p>
            <div className="mt-4 text-xs text-shiroi-400 group-hover:text-shiroi-300">
              Ingresar como alumno →
            </div>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-ink-500">
          ¿Problemas para ingresar? Contactá al dojo en{' '}
          <Link href="/contacto" className="text-shiroi-400 hover:text-shiroi-300 underline-offset-2 hover:underline">
            la página de contacto
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
