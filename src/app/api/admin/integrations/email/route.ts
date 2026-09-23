import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  EMAIL_KEY,
  getEmailCredentials,
  saveEmailCredentials,
  isEmailCredentials,
} from '@/lib/credentials/email';

export const runtime = 'nodejs';

export async function GET() {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const creds = await getEmailCredentials();
  if (!creds) {
    return NextResponse.json({ configured: false });
  }
  return NextResponse.json({
    configured: true,
    provider: creds.provider,
    fromAddress: creds.fromAddress,
    fromName: creds.fromName ?? null,
    hasResendApiKey: !!creds.resendApiKey,
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

  if (!isEmailCredentials(body)) {
    return NextResponse.json(
      {
        error:
          'Faltan campos requeridos: provider (resend|smtp), fromAddress.',
      },
      { status: 400 },
    );
  }

  // Si eligió Resend, exigimos API key.
  if (body.provider === 'resend' && !body.resendApiKey) {
    return NextResponse.json(
      { error: 'Para Resend se requiere resendApiKey.' },
      { status: 400 },
    );
  }

  await saveEmailCredentials(body);

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'save_integration_email',
      entity: 'integration',
      entityId: EMAIL_KEY,
      metadata: JSON.stringify({ provider: body.provider, fromAddress: body.fromAddress }),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await prisma.integrationConfig.deleteMany({ where: { key: EMAIL_KEY } });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'delete_integration_email',
      entity: 'integration',
      entityId: EMAIL_KEY,
    },
  });

  return NextResponse.json({ ok: true });
}
