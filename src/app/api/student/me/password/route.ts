import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getStudentSession } from '@/lib/auth-student';
import { StudentChangePasswordSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = StudentChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { currentPassword, newPassword } = parsed.data;

  const student = await prisma.student.findUnique({ where: { id: session.studentId } });
  if (!student) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const ok = await bcrypt.compare(currentPassword, student.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'La contraseña actual es incorrecta.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.student.update({
    where: { id: student.id },
    data: { passwordHash, mustChangePwd: false },
  });

  await prisma.auditLog.create({
    data: {
      userId: student.id,
      action: 'student_password_change',
      entity: 'student',
      entityId: student.id,
    },
  });

  return NextResponse.json({ ok: true });
}