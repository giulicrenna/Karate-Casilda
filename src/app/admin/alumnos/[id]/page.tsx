import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import AlumnoDetailTabs from '@/components/admin/AlumnoDetailTabs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Alumno', robots: { index: false, follow: false } };

export default async function AlumnoDetallePage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: { profile: true },
  });
  if (!student) notFound();

  const dto = {
    id: student.id,
    email: student.email,
    firstName: student.firstName,
    lastName: student.lastName,
    fullName: `${student.firstName} ${student.lastName}`,
    dni: student.dni,
    phone: student.phone,
    whatsapp: student.whatsapp,
    birthDate: student.birthDate?.toISOString() ?? null,
    active: student.active,
    joinedAt: student.joinedAt.toISOString(),
    mustChangePwd: student.mustChangePwd,
    profile: student.profile
      ? {
          weightKg: student.profile.weightKg != null ? Number(student.profile.weightKg) : null,
          heightCm: student.profile.heightCm,
          emergencyName: student.profile.emergencyName,
          emergencyPhone: student.profile.emergencyPhone,
          medicalNotes: student.profile.medicalNotes,
          allergies: student.profile.allergies,
          attendanceDaysPerWeek: student.profile.attendanceDaysPerWeek,
          belt: student.profile.belt,
          notes: student.profile.notes,
          photoDriveFileId: student.profile.photoDriveFileId,
        }
      : null,
  };

  return (
    <AdminShell>
      <header className="flex items-center justify-between gap-3 border-b border-ink-900 pb-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-shiroi-500">
            <Link href="/admin/alumnos" className="hover:text-shiroi-300">
              Alumnos
            </Link>{' '}
            · {student.lastName}, {student.firstName}
          </div>
          <h1 className="font-display text-2xl text-ink-50">{student.email}</h1>
        </div>
        <Link href={`/admin/alumnos/${student.id}/editar`} className="btn-secondary text-xs">
          <Pencil className="h-4 w-4" />
          Editar
        </Link>
      </header>

      <AlumnoDetailTabs student={dto} />
    </AdminShell>
  );
}