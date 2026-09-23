import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { checkLoginRateLimit, clearLoginRateLimit, createAdminSession } from '@/lib/auth';
import { LoginSchema } from '@/lib/validation';

export const runtime = 'nodejs';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Probá de nuevo en 15 minutos.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Email o contraseña inválidos.' },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });

  if (!user) {
    return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
  }

  await createAdminSession({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  clearLoginRateLimit(ip);

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'login',
      entity: 'user',
      entityId: user.id,
      ip,
    },
  });

  return NextResponse.json({ ok: true });
}
