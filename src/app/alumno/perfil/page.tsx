import { requireStudent } from '@/lib/guards';
import { prisma } from '@/lib/db';
import PortalShell from '@/components/alumno/PortalShell';
import ProfileForm from '@/components/alumno/ProfileForm';

export const dynamic = 'force-dynamic';

export default async function AlumnoPerfilPage() {
  const session = await requireStudent({ allowMustChange: true });

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: { profile: true },
  });

  if (!student) {
    return (
      <PortalShell email={session.email} mustChangePwd={session.mustChangePwd}>
        <p className="text-sm text-shiroi-400">No se pudo cargar tu perfil.</p>
      </PortalShell>
    );
  }

  return (
    <PortalShell email={student.email} mustChangePwd={session.mustChangePwd}>
      <header className="border-b border-ink-800 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Portal del alumno</div>
        <h1 className="font-display text-2xl text-ink-50">Mi perfil</h1>
        <p className="mt-1 text-xs text-ink-500">
          Mantené tus datos actualizados para que el dojo pueda contactarte y gestionar tu
          entrenamiento.
        </p>
      </header>

      <ProfileForm
        student={{
          phone: student.phone,
          whatsapp: student.whatsapp,
          weightKg: student.profile?.weightKg ? Number(student.profile.weightKg) : null,
          heightCm: student.profile?.heightCm ?? null,
          emergencyName: student.profile?.emergencyName ?? null,
          emergencyPhone: student.profile?.emergencyPhone ?? null,
          medicalNotes: student.profile?.medicalNotes ?? null,
          allergies: student.profile?.allergies ?? null,
          attendanceDaysPerWeek: student.profile?.attendanceDaysPerWeek ?? 2,
          belt: student.profile?.belt ?? null,
          notes: student.profile?.notes ?? null,
          photoDriveFileId: student.profile?.photoDriveFileId ?? null,
        }}
      />
    </PortalShell>
  );
}