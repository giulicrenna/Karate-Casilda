import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { GenerateDebtSchema } from '@/lib/validation';
import { generateMonthlyDebts } from '@/services/payments/fee-engine';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = GenerateDebtSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const result = await generateMonthlyDebts(data.periodYear, data.periodMonth, {
    dryRun: data.dryRun,
  });

  await import('@/lib/db').then(({ prisma }) =>
    prisma.auditLog.create({
      data: {
        userId: s.userId,
        action: data.dryRun ? 'preview_generate_debts' : 'generate_debts',
        entity: 'debt',
        metadata: JSON.stringify({
          periodYear: data.periodYear,
          periodMonth: data.periodMonth,
          generated: result.generated,
          skipped: result.skipped,
          errors: result.errors.length,
        }),
      },
    }),
  );

  return NextResponse.json(result);
}