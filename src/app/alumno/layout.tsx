import { getStudentSession } from '@/lib/auth-student';

export default async function AlumnoLayout({ children }: { children: React.ReactNode }) {
  // Layout pass-through: cada página chequea su sesión vía getStudentSession/requireStudent.
  // (Los layouts de Next.js App Router no reciben el pathname, por eso no redirigimos acá.)
  await getStudentSession();
  return <>{children}</>;
}

export async function generateMetadata() {
  return {
    title: 'Portal del alumno',
    robots: { index: false, follow: false },
  };
}