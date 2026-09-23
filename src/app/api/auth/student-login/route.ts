import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { checkRateLimit, clearRateLimit, getClientIp } from '@/lib/auth';
import { createStudentSession } from '@/lib/auth-student';
import { StudentLoginSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`student:${ip}`, { max: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Probá de nuevo en 15 minutos.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = StudentLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Email o contraseña inválidos.' },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const student = await prisma.student.findUnique({ where: { email: email.toLowerCase() } });

  if (!student || !student.active) {
    return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, student.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
  }

  await createStudentSession({
    studentId: student.id,
    email: student.email,
    mustChangePwd: student.mustChangePwd,
  });

  clearRateLimit(`student:${ip}`);

  await prisma.auditLog.create({
    data: {
      userId: student.id,
      action: 'student_login',
      entity: 'student',
      entityId: student.id,
      ip,
    },
  });

  return NextResponse.json({ ok: true, mustChangePwd: student.mustChangePwd });
}