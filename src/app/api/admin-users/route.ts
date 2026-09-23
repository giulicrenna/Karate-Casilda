import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { AdminUserCreateSchema } from '@/lib/validation';

export const runtime = 'nodejs';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function requireSuperadminOr401() {
  return getAdminSession().then((s) => {
    if (!s) return { session: null, error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
    if (s.role !== 'superadmin') {
      return {
        session: null,
        error: NextResponse.json({ error: 'Acceso restringido a superadmin' }, { status: 403 }),
      };
    }
    return { session: s, error: null };
  });
}

export async function GET(_req: NextRequest) {
  const { session, error } = await requireSuperadminOr401();
  if (error || !session) return error ?? NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const items = await prisma.adminUser.findMany({
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSuperadminOr401();
  if (error || !session) return error ?? NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = AdminUserCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const email = data.email.toLowerCase().trim();
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Ya existe un usuario con ese email.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const created = await prisma.adminUser.create({
    data: {
      email,
      name: data.name,
      role: data.role,
      passwordHash,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'create_admin_user',
      entity: 'admin_user',
      entityId: created.id,
      metadata: JSON.stringify({ email: created.email, role: created.role }),
      ip: getIp(req),
    },
  });

  return NextResponse.json(created, { status: 201 });
}