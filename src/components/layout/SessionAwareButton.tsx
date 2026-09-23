import 'server-only';
import Link from 'next/link';
import { LogIn, ShieldCheck, UserCircle } from 'lucide-react';
import { getAdminSession } from '@/lib/auth';
import { getStudentSession } from '@/lib/auth-student';

export default async function SessionAwareButton() {
  const [adminSession, studentSession] = await Promise.all([
    getAdminSession(),
    getStudentSession(),
  ]);

  if (adminSession) {
    return (
      <Link
        href="/admin/dashboard"
        className="btn-ghost text-[10px] flex items-center gap-1.5"
        title={`Sesión admin: ${adminSession.email}`}
      >
        <ShieldCheck className="h-3 w-3" />
        Panel admin
      </Link>
    );
  }

  if (studentSession) {
    return (
      <Link
        href={studentSession.mustChangePwd ? '/alumno/cambiar-password' : '/alumno'}
        className="btn-ghost text-[10px] flex items-center gap-1.5"
        title={`Sesión alumno: ${studentSession.email}`}
      >
        <UserCircle className="h-3 w-3" />
        Mi portal
      </Link>
    );
  }

  return (
    <Link href="/login" className="btn-primary text-[10px] flex items-center gap-1.5">
      <LogIn className="h-3 w-3" />
      Iniciar sesión
    </Link>
  );
}
