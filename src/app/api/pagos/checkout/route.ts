import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStudentSession } from '@/lib/auth-student';
import { CheckoutSchema } from '@/lib/validation';
import {
  MERCADOPAGO_KEY,
  getMercadoPagoCredentials,
} from '@/lib/credentials/mercadopago';
import { createPreference } from '@/services/mercadopago';
import { getSiteUrl } from '@/lib/site-url';

export const runtime = 'nodejs';

/**
 * POST /api/pagos/checkout
 * Auth: alumno. Body: { debtIds: string[] }
 * Crea UN Payment `mercadopago`/`pending` para UN conjunto de deudas del alumno
 * y devuelve `{ initPoint, preferenceId }` para redirigir al checkout de MP.
 */
export async function POST(req: NextRequest) {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // MP debe estar configurado.
  const creds = await getMercadoPagoCredentials();
  if (!creds) {
    return NextResponse.json(
      { error: 'Pasarela de pago no disponible.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { debtIds } = parsed.data;

  // Traemos las deudas y validamos que todas sean del alumno y estén activas.
  const debts = await prisma.debt.findMany({
    where: { id: { in: debtIds } },
  });

  if (debts.length !== debtIds.length) {
    return NextResponse.json(
      { error: 'Alguna de las deudas no existe.' },
      { status: 404 },
    );
  }

  const allowed: Record<string, boolean> = {
    pending: true,
    partial: true,
    overdue: true,
  };
  for (const d of debts) {
    if (d.studentId !== session.studentId) {
      return NextResponse.json(
        { error: 'Alguna de las deudas no pertenece al alumno.' },
        { status: 403 },
      );
    }
    if (d.status === 'paid' || d.status === 'cancelled' || !allowed[d.status]) {
      return NextResponse.json(
        { error: 'Todas las deudas deben estar pendientes, parciales o vencidas.' },
        { status: 400 },
      );
    }
  }

  // Total a pagar: suma de saldos restantes.
  const items = debts.map((d) => {
    const balance = Number(d.totalAmount) - Number(d.paidAmount);
    return {
      debt: d,
      amount: Math.round(balance * 100) / 100,
    };
  });
  const total = items.reduce((sum, it) => sum + it.amount, 0);
  if (total <= 0) {
    return NextResponse.json(
      { error: 'El monto total a pagar debe ser mayor a cero.' },
      { status: 400 },
    );
  }

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
  });
  if (!student) {
    return NextResponse.json({ error: 'Alumno no encontrado.' }, { status: 404 });
  }

  // Traemos la primera deuda como "principal" (campo debtId del Payment).
  // El resto va en `metadata` + el external_reference para reconciliar.
  const primary = items[0].debt;
  const debtBreakdown = items.map((it) => ({
    debtId: it.debt.id,
    amount: it.amount,
  }));

  const externalReference = `cart-${session.studentId}-${Date.now()}-${primary.id}`;
  const metadata = JSON.stringify({
    studentId: session.studentId,
    debts: debtBreakdown,
  });

  const payment = await prisma.payment.create({
    data: {
      studentId: session.studentId,
      debtId: primary.id,
      amount: total.toFixed(2),
      currency: 'ARS',
      method: 'mercadopago',
      status: 'pending',
      metadata,
    },
  });

  const siteUrl = getSiteUrl();
  const backUrls = {
    success: `${siteUrl}/alumno/deuda?status=success&payment=${payment.id}`,
    failure: `${siteUrl}/alumno/deuda?status=failure&payment=${payment.id}`,
    pending: `${siteUrl}/alumno/deuda?status=pending&payment=${payment.id}`,
  };
  const notificationUrl = `${siteUrl}/api/pagos/webhooks/mercadopago`;

  const preference = await createPreference({
    items: [
      {
        title:
          items.length === 1
            ? `Cuota ${primary.periodMonth}/${primary.periodYear}`
            : `${items.length} cuotas Karate Casilda`,
        quantity: 1,
        unit_price: total,
        currency_id: 'ARS',
      },
    ],
    payer: {
      email: student.email,
      name: `${student.firstName} ${student.lastName}`.trim(),
    },
    externalReference,
    notificationUrl,
    backUrls,
  });

  // Guardamos el preferenceId en el Payment para reconciliación.
  await prisma.payment.update({
    where: { id: payment.id },
    data: { mpPreferenceId: preference.id },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.studentId,
      action: 'mercadopago_checkout_created',
      entity: 'payment',
      entityId: payment.id,
      metadata: JSON.stringify({
        preferenceId: preference.id,
        amount: total,
        debtIds,
      }),
    },
  });

  return NextResponse.json({
    ok: true,
    paymentId: payment.id,
    preferenceId: preference.id,
    initPoint: preference.initPoint,
    environment: creds.environment,
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, key: MERCADOPAGO_KEY });
}
