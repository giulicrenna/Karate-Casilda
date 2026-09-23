import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStudentSession } from '@/lib/auth-student';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: { profile: true },
  });

  if (!student || !student.active) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return NextResponse.json(student);
}