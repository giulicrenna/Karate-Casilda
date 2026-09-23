import { requireAdmin } from '@/lib/guards';
import AdminShell from '@/components/admin/AdminShell';
import AlumnoForm from '@/components/admin/AlumnoForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nuevo alumno', robots: { index: false, follow: false } };

export default async function NuevoAlumnoPage() {
  await requireAdmin();

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Alumnos</div>
        <h1 className="font-display text-2xl text-ink-50">Nuevo alumno</h1>
        <p className="mt-1 text-xs text-ink-500">
          Crea una cuenta nueva. La contraseña inicial puede ser la del legajo o una temporal.
        </p>
      </header>
      <AlumnoForm mode="create" />
    </AdminShell>
  );
}