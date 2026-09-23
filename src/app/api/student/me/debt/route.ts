import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStudentSession } from '@/lib/auth-student';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const debts = await prisma.debt.findMany({
    where: { studentId: session.studentId },
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
  });

  // Serializar Decimals a number.
  const items = debts.map((d) => ({
    id: d.id,
    studentId: d.studentId,
    periodYear: d.periodYear,
    periodMonth: d.periodMonth,
    baseAmount: Number(d.baseAmount),
    surchargeAmount: Number(d.surchargeAmount),
    manualAdjustment: Number(d.manualAdjustment),
    totalAmount: Number(d.totalAmount),
    paidAmount: Number(d.paidAmount),
    dueDate: d.dueDate.toISOString(),
    status: d.status,
    manualNote: d.manualNote,
    notes: d.notes,
    balance: Number(d.totalAmount) - Number(d.paidAmount),
  }));

  return NextResponse.json({ items });
}