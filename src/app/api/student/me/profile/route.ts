import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStudentSession } from '@/lib/auth-student';
import { StudentUpdateSchema } from '@/lib/validation';

export const runtime = 'nodejs';

// Solo un subset de StudentUpdateSchema aplica al alumno.
const StudentSelfUpdateSchema = StudentUpdateSchema.pick({
  phone: true,
  whatsapp: true,
  weightKg: true,
  heightCm: true,
  emergencyName: true,
  emergencyPhone: true,
  medicalNotes: true,
  allergies: true,
  attendanceDaysPerWeek: true,
  belt: true,
  notes: true,
  photoDriveFileId: true,
});

export async function PATCH(req: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = StudentSelfUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const profileData: Record<string, unknown> = {};
  if (data.weightKg !== undefined) profileData.weightKg = data.weightKg ?? null;
  if (data.heightCm !== undefined) profileData.heightCm = data.heightCm ?? null;
  if (data.emergencyName !== undefined) profileData.emergencyName = data.emergencyName ?? null;
  if (data.emergencyPhone !== undefined) profileData.emergencyPhone = data.emergencyPhone ?? null;
  if (data.medicalNotes !== undefined) profileData.medicalNotes = data.medicalNotes ?? null;
  if (data.allergies !== undefined) profileData.allergies = data.allergies ?? null;
  if (data.attendanceDaysPerWeek !== undefined)
    profileData.attendanceDaysPerWeek = data.attendanceDaysPerWeek;
  if (data.belt !== undefined) profileData.belt = data.belt ?? null;
  if (data.notes !== undefined) profileData.notes = data.notes ?? null;
  if (data.photoDriveFileId !== undefined)
    profileData.photoDriveFileId = data.photoDriveFileId ?? null;

  const studentData: Record<string, unknown> = {};
  if (data.phone !== undefined) studentData.phone = data.phone ?? null;
  if (data.whatsapp !== undefined) {
    studentData.whatsapp = data.whatsapp && data.whatsapp.length > 0 ? data.whatsapp : null;
  }

  const updated = await prisma.student.update({
    where: { id: session.studentId },
    data: {
      ...studentData,
      profile: {
        upsert: {
          update: profileData,
          create: {
            attendanceDaysPerWeek:
              (profileData.attendanceDaysPerWeek as number | undefined) ?? 2,
            ...profileData,
          },
        },
      },
    },
    include: { profile: true },
  });

  return NextResponse.json(updated);
}