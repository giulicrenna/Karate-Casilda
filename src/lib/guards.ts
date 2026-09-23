import 'server-only';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';

/** Wrapper para páginas admin que requieren sesión. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  return session;
}
