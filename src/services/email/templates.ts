// Templates HTML (email) y de texto plano (WhatsApp).
// Español es_AR. Tono respetuoso pero directo.

/** Formatea un número como moneda ARS con Intl (es-AR). */
function ars(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function layout(content: string): string {
  return `<!DOCTYPE html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f5f5f4;padding:20px;color:#0a0a0a;">
    <div style="max-width:600px;margin:auto;background:#ffffff;padding:32px;border-radius:8px;border:1px solid #e7e5e4;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#b91c1c;margin-bottom:8px;">
        Dojo Shiroi Ryu · Karate Casilda
      </div>
      ${content}
      <hr style="margin-top:32px;border:none;border-top:1px solid #e7e5e4;" />
      <p style="font-size:11px;color:#78716c;margin-top:12px;">
        Este mensaje fue enviado automáticamente. Si necesitás ayuda, respondé a este email.
      </p>
    </div>
  </body></html>`;
}

// =====================================================
// EMAIL TEMPLATES
// =====================================================

export const emailTemplates = {
  /** Pago recibido del alumno → confirma al alumno. */
  paymentReceived: (vars: {
    firstName: string;
    amount: number;
    period: string;
    balance: number;
    deudaUrl: string;
  }) =>
    layout(`
      <h1 style="color:#0a0a0a;margin:0 0 8px 0;">¡Gracias por tu pago, ${vars.firstName}!</h1>
      <p style="font-size:15px;line-height:1.5;">
        Recibimos tu pago de <strong>${ars(vars.amount)}</strong> correspondiente a <strong>${vars.period}</strong>.
      </p>
      <p style="font-size:15px;line-height:1.5;">
        Saldo pendiente: <strong>${ars(vars.balance)}</strong>.
      </p>
      <p style="margin-top:24px;">
        <a href="${vars.deudaUrl}" style="display:inline-block;padding:12px 24px;background:#b91c1c;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600;">
          Ver mis deudas
        </a>
      </p>
      <p style="font-size:13px;color:#57534e;">¡Gracias por entrenar con nosotros! 🥋</p>
    `),

  /** Pago recibido → notifica a los admins. */
  paymentReceivedAdmin: (vars: {
    studentName: string;
    amount: number;
    period: string;
    paidAt: string;
  }) =>
    layout(`
      <h1 style="color:#0a0a0a;margin:0 0 8px 0;">Pago recibido</h1>
      <p style="font-size:15px;line-height:1.5;">
        <strong>${vars.studentName}</strong> registró un pago de <strong>${ars(vars.amount)}</strong>
        correspondiente a <strong>${vars.period}</strong>.
      </p>
      <p style="font-size:13px;color:#57534e;margin-top:16px;">
        Pagado el <strong>${vars.paidAt}</strong>. Revisá el historial en el panel de pagos.
      </p>
    `),

  /** Recordatorio de cuota próxima a vencer. */
  dueReminder: (vars: {
    firstName: string;
    amount: number;
    period: string;
    dueDate: string;
    deudaUrl: string;
  }) =>
    layout(`
      <h1 style="color:#0a0a0a;margin:0 0 8px 0;">Hola, ${vars.firstName}</h1>
      <p style="font-size:15px;line-height:1.5;">
        Te recordamos que tu cuota de <strong>${vars.period}</strong> por <strong>${ars(vars.amount)}</strong>
        vence el <strong>${vars.dueDate}</strong>.
      </p>
      <p style="margin-top:24px;">
        <a href="${vars.deudaUrl}" style="display:inline-block;padding:12px 24px;background:#0a0a0a;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600;">
          Ir al portal de pagos
        </a>
      </p>
    `),

  /** Aviso de cuota vencida. */
  overdue: (vars: {
    firstName: string;
    amount: number;
    period: string;
    daysOverdue: number;
    deudaUrl: string;
  }) =>
    layout(`
      <h1 style="color:#b91c1c;margin:0 0 8px 0;">Cuota atrasada</h1>
      <p style="font-size:15px;line-height:1.5;">
        Hola, <strong>${vars.firstName}</strong>. Tu cuota de <strong>${vars.period}</strong>
        por <strong>${ars(vars.amount)}</strong> está atrasada hace <strong>${vars.daysOverdue} días</strong>.
      </p>
      <p style="font-size:15px;line-height:1.5;">
        Regularizá tu situación para mantenerte al día con el dojo.
      </p>
      <p style="margin-top:24px;">
        <a href="${vars.deudaUrl}" style="display:inline-block;padding:12px 24px;background:#b91c1c;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600;">
          Pagar ahora
        </a>
      </p>
    `),

  /** Bienvenida al alumno nuevo. */
  welcome: (vars: { firstName: string; email: string; initialPassword: string; loginUrl: string }) =>
    layout(`
      <h1 style="color:#0a0a0a;margin:0 0 8px 0;">¡Bienvenido al Dojo Shiroi Ryu, ${vars.firstName}! 🥋</h1>
      <p style="font-size:15px;line-height:1.5;">
        Tu cuenta fue creada en nuestro portal de alumnos. Estos son tus datos de acceso:
      </p>
      <ul style="font-size:14px;line-height:1.8;background:#f5f5f4;padding:16px 24px;border-radius:6px;">
        <li><strong>Email:</strong> ${vars.email}</li>
        <li><strong>Contraseña inicial:</strong> ${vars.initialPassword}</li>
      </ul>
      <p style="font-size:14px;color:#b91c1c;line-height:1.5;">
        Por seguridad te pedimos cambiar la contraseña en tu primer ingreso.
      </p>
      <p style="margin-top:24px;">
        <a href="${vars.loginUrl}" style="display:inline-block;padding:12px 24px;background:#b91c1c;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600;">
          Ingresar al portal
        </a>
      </p>
    `),

  /** Recuperación de contraseña. */
  passwordReset: (vars: { firstName: string; resetUrl: string }) =>
    layout(`
      <h1 style="color:#0a0a0a;margin:0 0 8px 0;">Restablecer contraseña</h1>
      <p style="font-size:15px;line-height:1.5;">
        Hola, <strong>${vars.firstName}</strong>. Recibimos un pedido para restablecer tu contraseña.
      </p>
      <p style="font-size:15px;line-height:1.5;">
        Hacé clic en el siguiente enlace para crear una nueva. El enlace caduca en 1 hora.
      </p>
      <p style="margin-top:24px;">
        <a href="${vars.resetUrl}" style="display:inline-block;padding:12px 24px;background:#b91c1c;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600;">
          Restablecer contraseña
        </a>
      </p>
      <p style="font-size:12px;color:#78716c;margin-top:24px;">
        Si no pediste este cambio, podés ignorar este mensaje.
      </p>
    `),
};

// =====================================================
// WHATSAPP TEMPLATES (texto plano)
// =====================================================

export const whatsappTemplates = {
  paymentReceived: (vars: { firstName: string; amount: number; period: string }) =>
    `Hola ${vars.firstName}! Recibimos tu pago de ${ars(vars.amount)} (${vars.period}). ¡Gracias! 🥋`,

  dueReminder: (vars: { firstName: string; amount: number; period: string; dueDate: string }) =>
    `Hola ${vars.firstName}, te recordamos que tu cuota de ${vars.period} (${ars(vars.amount)}) vence el ${vars.dueDate}. Podés pagarla desde el portal del alumno.`,

  overdue: (vars: { firstName: string; amount: number; period: string }) =>
    `Hola ${vars.firstName}, tu cuota de ${vars.period} (${ars(vars.amount)}) está atrasada. Regularizá tu situación en el portal del alumno para mantenerte al día.`,

  welcome: (vars: { firstName: string }) =>
    `¡Bienvenido al Dojo Shiroi Ryu, ${vars.firstName}! 🥋 Tu cuenta fue creada. Ingresá al portal para ver tu información.`,
};
