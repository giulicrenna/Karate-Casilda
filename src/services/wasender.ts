// Cliente REST para WaSender API. Mensajes de texto plano.
// Documentación: https://www.wasenderapi.com

import 'server-only';
import { getWaSenderCredentials } from '@/lib/credentials/wasender';

const DEFAULT_BASE = 'https://www.wasenderapi.com';

export interface WaSenderResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía un mensaje de WhatsApp usando WaSender.
 * Endpoint: POST {baseUrl}/api/send-message
 * Auth:     Authorization: Bearer <apiKey>
 * Body:     { to: "+5493464520203", text: "..." }
 */
export async function sendWhatsapp(
  to: string,
  text: string,
): Promise<WaSenderResult> {
  const creds = await getWaSenderCredentials();
  if (!creds) {
    return { ok: false, error: 'WaSender no configurado' };
  }
  const base = creds.baseUrl || DEFAULT_BASE;
  try {
    const res = await fetch(`${base}/api/send-message`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, text }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: `WaSender error: ${res.status} ${t}` };
    }
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const messageId =
      (typeof json.messageId === 'string' && json.messageId) ||
      (typeof json.id === 'string' && json.id) ||
      (typeof json.message_id === 'string' && json.message_id) ||
      undefined;
    return { ok: true, messageId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error desconocido' };
  }
}

/** Indica si WaSender está configurado en el sistema. */
export async function waSenderConfigured(): Promise<boolean> {
  return (await getWaSenderCredentials()) !== null;
}
