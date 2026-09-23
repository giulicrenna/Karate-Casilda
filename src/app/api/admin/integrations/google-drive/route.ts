import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { encryptSecret } from '@/lib/secrets';
import {
  GOOGLE_DRIVE_KEY,
  getServiceAccountCredentials,
  isServiceAccountJson,
} from '@/lib/google-credentials';

export const runtime = 'nodejs';

export async function GET() {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const creds = await getServiceAccountCredentials();
  if (!creds) return NextResponse.json({ configured: false });

  return NextResponse.json({
    configured: true,
    clientEmail: creds.client_email,
    projectId: creds.project_id,
    updatedAt: null,
  });
}

export async function PUT(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (!isServiceAccountJson(raw)) {
    return NextResponse.json(
      { error: 'El archivo no es una Service Account válida (faltan type/project_id/private_key/client_email).' },
      { status: 400 }
    );
  }

  const encrypted = encryptSecret(JSON.stringify(raw), GOOGLE_DRIVE_KEY);
  await prisma.integrationConfig.upsert({
    where: { key: GOOGLE_DRIVE_KEY },
    create: { key: GOOGLE_DRIVE_KEY, encrypted },
    update: { encrypted },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'update_google_drive_sa',
      entity: 'integration',
      entityId: GOOGLE_DRIVE_KEY,
      metadata: JSON.stringify({ clientEmail: raw.client_email }),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await prisma.integrationConfig.deleteMany({ where: { key: GOOGLE_DRIVE_KEY } });
  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'delete_google_drive_sa',
      entity: 'integration',
      entityId: GOOGLE_DRIVE_KEY,
    },
  });

  return NextResponse.json({ ok: true });
}
