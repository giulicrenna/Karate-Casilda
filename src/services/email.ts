// Servicio de email. Soporta Resend (default) y placeholder SMTP (no implementado).
// Documentación Resend: https://resend.com/docs/api-reference/emails/send-email

import 'server-only';
import { getEmailCredentials } from '@/lib/credentials/email';

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const creds = await getEmailCredentials();
  if (!creds) {
    return { ok: false, error: 'Email no configurado' };
  }
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const fromName = creds.fromName || 'Dojo Shiroi Ryu';
  const from = `${fromName} <${creds.fromAddress}>`;

  if (creds.provider === 'resend' && creds.resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: recipients,
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        return { ok: false, error: `Resend error: ${res.status} ${t}` };
      }
      const json = (await res.json()) as { id?: string };
      return { ok: true, id: json.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Error desconocido' };
    }
  }

  // SMTP: no soportado en esta versión. Si el admin quiere SMTP real,
  // hay que sumar `nodemailer` como dependencia.
  return {
    ok: false,
    error: 'SMTP no soportado en esta versión. Configurá Resend.',
  };
}

/** Indica si el email está configurado. */
export async function emailConfigured(): Promise<boolean> {
  return (await getEmailCredentials()) !== null;
}
