import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { destroyStudentSession, getStudentSession } from '@/lib/auth-student';

export const runtime = 'nodejs';

export async function POST() {
  const session = await getStudentSession();
  if (session) {
    await prisma.auditLog.create({
      data: {
        userId: session.studentId,
        action: 'student_logout',
        entity: 'student',
        entityId: session.studentId,
      },
    });
  }
  await destroyStudentSession();
  return NextResponse.json({ ok: true });
}