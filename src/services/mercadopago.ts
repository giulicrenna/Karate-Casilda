// Cliente REST para Mercado Pago. Sin SDK — usamos `fetch` directo.
// Endpoints:
//   POST /checkout/preferences       → crear preferencia
//   GET  /v1/payments/{id}           → consultar estado de un pago
//   POST /v1/payments/{id}/refunds   → revertir un pago aprobado
//
// Más info: https://www.mercadopago.com.ar/developers/es/reference

import 'server-only';
import crypto from 'node:crypto';
import {
  getMercadoPagoCredentials,
  getMercadoPagoBaseUrl,
} from '@/lib/credentials/mercadopago';

export interface CreatePreferenceItem {
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface CreatePreferenceInput {
  items: CreatePreferenceItem[];
  payer: { email: string; name?: string };
  externalReference: string;
  notificationUrl: string;
  backUrls: { success: string; failure: string; pending: string };
  autoReturn?: boolean;
}

export interface Preference {
  id: string;
  initPoint: string;
}

export async function createPreference(input: CreatePreferenceInput): Promise<Preference> {
  const creds = await getMercadoPagoCredentials();
  if (!creds) throw new Error('Mercado Pago no configurado');
  const base = getMercadoPagoBaseUrl(creds.environment);
  const res = await fetch(`${base}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${creds.accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': input.externalReference,
    },
    body: JSON.stringify({
      items: input.items.map((it) => ({
        title: it.title,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        currency_id: it.currency_id ?? 'ARS',
      })),
      payer: input.payer,
      external_reference: input.externalReference,
      notification_url: input.notificationUrl,
      back_urls: input.backUrls,
      auto_return: input.autoReturn === false ? 'all' : 'all',
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Mercado Pago error: ${res.status} ${t}`);
  }
  const json = (await res.json()) as { id: string; init_point: string };
  return { id: json.id, initPoint: json.init_point };
}

export interface MPPayment {
  id: number;
  status:
    | 'approved'
    | 'pending'
    | 'rejected'
    | 'refunded'
    | 'cancelled'
    | 'in_process'
    | 'authorized';
  status_detail: string;
  transaction_amount: number;
  date_approved: string | null;
  external_reference: string | null;
}

export async function getPayment(paymentId: string | number): Promise<MPPayment> {
  const creds = await getMercadoPagoCredentials();
  if (!creds) throw new Error('Mercado Pago no configurado');
  const base = getMercadoPagoBaseUrl(creds.environment);
  const res = await fetch(`${base}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${creds.accessToken}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Error fetching payment: ${res.status} ${t}`);
  }
  return (await res.json()) as MPPayment;
}

export async function refundPayment(
  paymentId: string | number,
  amount?: number,
): Promise<void> {
  const creds = await getMercadoPagoCredentials();
  if (!creds) throw new Error('Mercado Pago no configurado');
  const base = getMercadoPagoBaseUrl(creds.environment);
  const res = await fetch(`${base}/v1/payments/${paymentId}/refunds`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${creds.accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `refund-${paymentId}-${Date.now()}`,
    },
    body: JSON.stringify(amount ? { amount } : {}),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Refund error: ${res.status} ${t}`);
  }
}

/**
 * Valida la firma `x-signature` que Mercado Pago envía en los webhooks.
 * Formato MP de la firma:  `ts=XXXXXXXX,v1=YYYYYY`
 * El manifest que se firma es: `id={dataId};request-id={xRequestId};ts={ts};`
 * (donde `dataId` viene del campo `data.id` del body JSON).
 *
 * @param xSignature  valor del header `x-signature`
 * @param xRequestId  valor del header `x-request-id`
 * @param dataId      campo `data.id` del payload
 * @param secret      webhook secret configurado por el admin
 */
export function validateWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string | string | null | undefined,
  secret: string,
): boolean {
  if (!xSignature || !xRequestId || !dataId) return false;
  const parts = xSignature.split(',').reduce(
    (acc, part) => {
      const [k, v] = part.split('=');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    },
    {} as Record<string, string>,
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id=${dataId};request-id=${xRequestId};ts=${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  try {
    const a = Buffer.from(v1, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
