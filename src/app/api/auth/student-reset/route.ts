import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import {
  createStudentSession,
  hashPasswordResetToken,
} from '@/lib/auth-student';
import { StudentResetPasswordSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = StudentResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { token, newPassword } = parsed.data;

  const tokenHash = hashPasswordResetToken(token);
  const reset = await prisma.studentPasswordReset.findUnique({
    where: { tokenHash },
    include: { student: true },
  });

  if (!reset || reset.usedAt || reset.expiresAt < new Date() || !reset.student.active) {
    return NextResponse.json(
      { error: 'El enlace de recuperación es inválido o expiró.' },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.student.update({
      where: { id: reset.studentId },
      data: { passwordHash, mustChangePwd: false },
    }),
    prisma.studentPasswordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
    // Invalidar resets previos no usados para el mismo estudiante.
    prisma.studentPasswordReset.updateMany({
      where: {
        studentId: reset.studentId,
        usedAt: null,
        id: { not: reset.id },
      },
      data: { usedAt: new Date() },
    }),
  ]);

  await createStudentSession({
    studentId: reset.student.id,
    email: reset.student.email,
    mustChangePwd: false,
  });

  await prisma.auditLog.create({
    data: {
      userId: reset.student.id,
      action: 'student_password_reset',
      entity: 'student',
      entityId: reset.student.id,
    },
  });

  return NextResponse.json({ ok: true });
}