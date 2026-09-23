import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getMercadoPagoCredentials } from '@/lib/credentials/mercadopago';
import { validateWebhookSignature } from '@/services/mercadopago';
import { reconcilePayment } from '@/services/payments/reconcile';

export const runtime = 'nodejs';
// Importante: NO queremos caché estático del cuerpo crudo.
export const dynamic = 'force-dynamic';

/**
 * POST /api/pagos/webhooks/mercadopago
 *
 * Webhook público de Mercado Pago. Valida firma, persiste el evento
 * y dispara la reconciliación. Responde 200 salvo firma inválida (401).
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');

  let body: { type?: string; data?: { id?: string | number } } = {};
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = {};
  }

  const dataId = body?.data?.id != null ? String(body.data.id) : null;

  // Validación de credenciales + firma.
  const creds = await getMercadoPagoCredentials();
  if (!creds) {
    return NextResponse.json({ error: 'Integration not configured' }, { status: 401 });
  }
  if (!validateWebhookSignature(xSignature, xRequestId, dataId, creds.webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Persistimos el webhook (idempotente: si llega duplicado, queda registro).
  try {
    await prisma.paymentWebhookEvent.create({
      data: {
        source: 'mercadopago',
        eventType: body?.type ?? 'unknown',
        mpPaymentId: dataId,
        payload: rawBody,
        processed: false,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[webhook] no se pudo persistir evento:', e);
    // Aún así intentamos reconciliar.
  }

  // Solo procesamos eventos de tipo 'payment'.
  if (body?.type === 'payment' && dataId) {
    const result = await reconcilePayment(dataId);
    if (result.status === 'error') {
      // Respondemos 200 para que MP no reintente agresivamente si el error
      // es "no encontrado localmente" — pero MP también espera 200 cuando
      // el evento fue recibido, así que para mantener semántica consistente
      // respondemos 200 siempre, excepto en firma inválida.
      // eslint-disable-next-line no-console
      console.error('[webhook] reconcile error:', result.message);
    }
  }

  return NextResponse.json({ ok: true });
}

/**
 * GET /api/pagos/webhooks/mercadopago
 * Probe — algunos scanners esperan un 200 en GET.
 */
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Mercado Pago webhook endpoint' });
}
