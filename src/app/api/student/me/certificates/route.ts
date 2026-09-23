import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStudentSession } from '@/lib/auth-student';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const items = await prisma.certificate.findMany({
    where: { studentId: session.studentId },
    orderBy: { issuedAt: 'desc' },
  });

  return NextResponse.json({ items });
}