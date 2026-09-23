import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  WASENDER_KEY,
  getWaSenderCredentials,
  saveWaSenderCredentials,
  isWaSenderCredentials,
} from '@/lib/credentials/wasender';

export const runtime = 'nodejs';

export async function GET() {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const creds = await getWaSenderCredentials();
  if (!creds) {
    return NextResponse.json({ configured: false });
  }
  // Nunca devolvemos apiKey.
  return NextResponse.json({
    configured: true,
    hasApiKey: !!creds.apiKey,
    baseUrl: creds.baseUrl ?? null,
    phoneNumber: creds.phoneNumber ?? null,
  });
}

export async function POST(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (!isWaSenderCredentials(body)) {
    return NextResponse.json(
      { error: 'Falta apiKey.' },
      { status: 400 },
    );
  }

  await saveWaSenderCredentials(body);

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'save_integration_wasender',
      entity: 'integration',
      entityId: WASENDER_KEY,
      metadata: JSON.stringify({ baseUrl: body.baseUrl ?? null }),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await prisma.integrationConfig.deleteMany({ where: { key: WASENDER_KEY } });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'delete_integration_wasender',
      entity: 'integration',
      entityId: WASENDER_KEY,
    },
  });

  return NextResponse.json({ ok: true });
}
