import { NextResponse } from 'next/server';
import { destroyAdminSession, getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    await prisma.auditLog.create({
      data: { userId: session.userId, action: 'logout', entity: 'user', entityId: session.userId },
    });
  }
  await destroyAdminSession();
  return NextResponse.json({ ok: true });
}
