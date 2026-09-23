import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/auth';
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from '@/lib/auth-student';
import { StudentRecoverRequestSchema } from '@/lib/validation';

export const runtime = 'nodejs';

const NEUTRAL_MESSAGE =
  'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña en los próximos minutos.';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`student-recover:${ip}`, { max: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    // Mismo mensaje neutro para evitar timing attacks / fingerprinting.
    return NextResponse.json({ ok: true, message: NEUTRAL_MESSAGE });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true, message: NEUTRAL_MESSAGE });
  }

  const parsed = StudentRecoverRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true, message: NEUTRAL_MESSAGE });
  }
  const email = parsed.data.email.toLowerCase();

  const student = await prisma.student.findUnique({ where: { email } });

  if (student && student.active) {
    const token = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await prisma.studentPasswordReset.create({
      data: {
        studentId: student.id,
        tokenHash,
        expiresAt,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (req.headers.get('origin') ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`);
    const resetUrl = `${baseUrl}/alumno/recuperar?token=${encodeURIComponent(token)}`;

    // Phase 5 implementa email real; por ahora solo log + NotificationLog skipped.
    // eslint-disable-next-line no-console
    console.log('[student-recover] reset url for', email, ':', resetUrl);

    await prisma.notificationLog.create({
      data: {
        channel: 'email',
        recipient: email,
        template: 'password_reset',
        relatedStudentId: student.id,
        payload: JSON.stringify({ resetUrl }),
        status: 'skipped',
        errorMessage: 'Email sender no implementado en Fase 2',
      },
    });
  }

  return NextResponse.json({ ok: true, message: NEUTRAL_MESSAGE });
}