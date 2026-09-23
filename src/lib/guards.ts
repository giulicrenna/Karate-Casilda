import 'server-only';
import { redirect } from 'next/navigation';
import { getAdminSession, AdminSessionPayload } from '@/lib/auth';
import { getStudentSession, StudentSessionPayload } from '@/lib/auth-student';

export type AdminRole = 'superadmin' | 'admin' | 'editor';

export const SUPERADMIN: AdminRole = 'superadmin';
export const ADMIN: AdminRole = 'admin';
export const EDITOR: AdminRole = 'editor';

/** Wrapper para páginas admin que requieren sesión. */
export async function requireAdmin(): Promise<AdminSessionPayload & { role: AdminRole }> {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  return session as AdminSessionPayload & { role: AdminRole };
}

/** Wrapper para páginas admin que requieren uno o más roles. */
export async function requireRole(
  ...allowed: AdminRole[]
): Promise<AdminSessionPayload & { role: AdminRole }> {
  const session = await requireAdmin();
  if (!allowed.includes(session.role)) {
    redirect('/admin/dashboard');
  }
  return session;
}

/** Verifica que el admin tenga alguno de los roles permitidos, sin redirigir. */
export function hasRole(
  session: AdminSessionPayload | null,
  ...allowed: AdminRole[]
): boolean {
  if (!session) return false;
  return allowed.includes(session.role as AdminRole);
}

/** Wrapper para páginas del portal alumno. */
export async function requireStudent(
  opts: { allowMustChange?: boolean } = {},
): Promise<StudentSessionPayload> {
  const session = await getStudentSession();
  if (!session) {
    redirect('/alumno/login');
  }
  if (!opts.allowMustChange && session.mustChangePwd) {
    redirect('/alumno/cambiar-password');
  }
  return session;
}