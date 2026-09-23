import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/guards';
import { prisma } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import AlumnoForm from '@/components/admin/AlumnoForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar alumno', robots: { index: false, follow: false } };

export default async function EditarAlumnoPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: { profile: true },
  });
  if (!student) notFound();

  return (
    <AdminShell>
      <header className="border-b border-ink-900 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">
          Alumnos · {student.lastName}, {student.firstName}
        </div>
        <h1 className="font-display text-2xl text-ink-50">Editar alumno</h1>
      </header>
      <AlumnoForm
        mode="edit"
        studentId={student.id}
        initial={{
          id: student.id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          dni: student.dni,
          phone: student.phone,
          whatsapp: student.whatsapp,
          birthDate: student.birthDate?.toISOString() ?? null,
          active: student.active,
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
        }}
      />
    </AdminShell>
  );
}