'use client';

import { useState } from 'react';
import MercadoPagoConfig from './MercadoPagoConfig';
import WaSenderConfig from './WaSenderConfig';
import EmailConfig from './EmailConfig';

type TabKey = 'mercadopago' | 'wasender' | 'email';

interface MercadoPagoStatus {
  configured: boolean;
  environment?: 'sandbox' | 'production';
  publicKey?: string | null;
}

interface EmailStatus {
  configured: boolean;
  provider?: 'resend' | 'smtp';
  fromAddress?: string | null;
  fromName?: string | null;
}

interface Props {
  mp: MercadoPagoStatus;
  wasender: { configured: boolean };
  email: EmailStatus;
}

/**
 * Tabs con los 3 forms de integración de pagos/notificaciones.
 * El form de Google Drive se sigue mostrando aparte en la página padre.
 */
export default function PaymentConfigFormsTabs({ mp, wasender, email }: Props) {
  const [tab, setTab] = useState<TabKey>('mercadopago');

  const classes = (active: boolean) =>
    [
      'inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs uppercase tracking-wider transition-colors',
      active
        ? 'bg-shiroi-900/40 text-shiroi-300 border border-shiroi-700'
        : 'text-ink-400 hover:text-ink-100 border border-transparent',
    ].join(' ');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-ink-900 pb-3">
        <button
          type="button"
          className={classes(tab === 'mercadopago')}
          onClick={() => setTab('mercadopago')}
        >
          Mercado Pago
          <Dot configured={mp.configured} />
        </button>
        <button
          type="button"
          className={classes(tab === 'wasender')}
          onClick={() => setTab('wasender')}
        >
          WaSender (WhatsApp)
          <Dot configured={wasender.configured} />
        </button>
        <button
          type="button"
          className={classes(tab === 'email')}
          onClick={() => setTab('email')}
        >
          Email
          <Dot configured={email.configured} />
        </button>
      </div>

      {tab === 'mercadopago' && (
        <MercadoPagoConfig
          initialConfigured={mp.configured}
          initialEnvironment={mp.environment ?? null}
          initialPublicKey={mp.publicKey ?? null}
        />
      )}
      {tab === 'wasender' && (
        <WaSenderConfig initialConfigured={wasender.configured} />
      )}
      {tab === 'email' && (
        <EmailConfig
          initialConfigured={email.configured}
          initialProvider={email.provider ?? null}
          initialFromAddress={email.fromAddress ?? null}
          initialFromName={email.fromName ?? null}
        />
      )}
    </div>
  );
}

function Dot({ configured }: { configured: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        configured ? 'bg-emerald-400' : 'bg-ink-700'
      }`}
      aria-label={configured ? 'configurado' : 'no configurado'}
    />
  );
}
