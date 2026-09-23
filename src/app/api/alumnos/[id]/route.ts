import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { StudentUpdateSchema } from '@/lib/validation';

export const runtime = 'nodejs';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: { profile: true },
  });
  if (!student) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  return NextResponse.json(student);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = StudentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const existing = await prisma.student.findUnique({
    where: { id: params.id },
    include: { profile: true },
  });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  if (data.email && data.email.toLowerCase() !== existing.email) {
    const dup = await prisma.student.findUnique({ where: { email: data.email.toLowerCase() } });
    if (dup) {
      return NextResponse.json({ error: 'Ya existe un alumno con ese email.' }, { status: 409 });
    }
  }

  if (data.dni && data.dni !== existing.dni) {
    const dup = await prisma.student.findUnique({ where: { dni: data.dni } });
    if (dup) {
      return NextResponse.json({ error: 'Ya existe un alumno con ese DNI.' }, { status: 409 });
    }
  }

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
  if (data.photoDriveFileId !== undefined) profileData.photoDriveFileId = data.photoDriveFileId ?? null;

  const studentData: Record<string, unknown> = {};
  if (data.email !== undefined) studentData.email = data.email.toLowerCase();
  if (data.firstName !== undefined) studentData.firstName = data.firstName;
  if (data.lastName !== undefined) studentData.lastName = data.lastName;
  if (data.dni !== undefined) studentData.dni = data.dni ?? null;
  if (data.phone !== undefined) studentData.phone = data.phone ?? null;
  if (data.whatsapp !== undefined) {
    studentData.whatsapp = data.whatsapp && data.whatsapp.length > 0 ? data.whatsapp : null;
  }
  if (data.birthDate !== undefined) {
    studentData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
  }
  if (data.active !== undefined) studentData.active = data.active;

  const updated = await prisma.student.update({
    where: { id: params.id },
    data: {
      ...studentData,
      profile:
        Object.keys(profileData).length > 0
          ? { update: profileData }
          : undefined,
    },
    include: { profile: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'update_student',
      entity: 'student',
      entityId: updated.id,
      ip: getIp(req),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const existing = await prisma.student.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  // Soft delete: marcar como inactivo.
  const updated = await prisma.student.update({
    where: { id: params.id },
    data: { active: false },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'deactivate_student',
      entity: 'student',
      entityId: params.id,
      ip: getIp(req),
    },
  });

  return NextResponse.json({ ok: true, student: updated });
}