import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  MERCADOPAGO_KEY,
  getMercadoPagoCredentials,
  saveMercadoPagoCredentials,
  isMercadoPagoCredentials,
} from '@/lib/credentials/mercadopago';

export const runtime = 'nodejs';

export async function GET() {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const creds = await getMercadoPagoCredentials();
  if (!creds) {
    return NextResponse.json({ configured: false });
  }

  // Nunca devolvemos accessToken / webhookSecret. Solo datos seguros.
  return NextResponse.json({
    configured: true,
    environment: creds.environment,
    publicKey: creds.publicKey,
    hasAccessToken: !!creds.accessToken,
    hasWebhookSecret: !!creds.webhookSecret,
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

  if (!isMercadoPagoCredentials(body)) {
    return NextResponse.json(
      {
        error:
          'Faltan campos requeridos: accessToken, publicKey, webhookSecret o environment (sandbox|production).',
      },
      { status: 400 },
    );
  }

  await saveMercadoPagoCredentials(body);

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'save_integration_mercadopago',
      entity: 'integration',
      entityId: MERCADOPAGO_KEY,
      metadata: JSON.stringify({ environment: body.environment, publicKey: body.publicKey }),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await prisma.integrationConfig.deleteMany({ where: { key: MERCADOPAGO_KEY } });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'delete_integration_mercadopago',
      entity: 'integration',
      entityId: MERCADOPAGO_KEY,
    },
  });

  return NextResponse.json({ ok: true });
}
