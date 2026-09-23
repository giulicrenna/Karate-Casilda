import { redirect } from 'next/navigation';
import { getStudentSession } from '@/lib/auth-student';
import StudentLoginForm from '@/components/alumno/StudentLoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Iniciar sesión', robots: { index: false, follow: false } };

export default async function AlumnoLoginPage() {
  const session = await getStudentSession();
  if (session) {
    if (session.mustChangePwd) redirect('/alumno/cambiar-password');
    redirect('/alumno');
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-shiroi p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-sm border border-shiroi-700 bg-ink-950 font-display text-3xl text-shiroi-500">
            空
          </div>
          <h1 className="mt-4 font-display text-2xl text-ink-50">Portal del alumno</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-shiroi-500">
            Dojo Shiroi Ryu
          </p>
        </div>
        <StudentLoginForm />
      </div>
    </div>
  );
}