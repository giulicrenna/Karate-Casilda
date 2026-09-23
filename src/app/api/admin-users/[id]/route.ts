import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { AdminUserUpdateSchema } from '@/lib/validation';

export const runtime = 'nodejs';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

async function requireSuperadminOr401() {
  const s = await getAdminSession();
  if (!s) return { session: null, error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  if (s.role !== 'superadmin') {
    return {
      session: null,
      error: NextResponse.json({ error: 'Acceso restringido a superadmin' }, { status: 403 }),
    };
  }
  return { session: s, error: null };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireSuperadminOr401();
  if (error) return error;

  const user = await prisma.adminUser.findUnique({
    where: { id: params.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSuperadminOr401();
  if (error || !session) return error ?? NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = AdminUserUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const existing = await prisma.adminUser.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  if (data.email && data.email.toLowerCase() !== existing.email) {
    const dup = await prisma.adminUser.findUnique({ where: { email: data.email.toLowerCase() } });
    if (dup) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email.' }, { status: 409 });
    }
  }

  // No permitir degradar al último superadmin.
  if (existing.role === 'superadmin' && data.role && data.role !== 'superadmin') {
    const superadminCount = await prisma.adminUser.count({ where: { role: 'superadmin' } });
    if (superadminCount <= 1) {
      return NextResponse.json(
        { error: 'No podés degradar al único superadmin del sistema.' },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.email !== undefined) updateData.email = data.email.toLowerCase();
  if (data.name !== undefined) updateData.name = data.name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 12);
  }

  const updated = await prisma.adminUser.update({
    where: { id: params.id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'update_admin_user',
      entity: 'admin_user',
      entityId: updated.id,
      metadata: JSON.stringify({ changedFields: Object.keys(data) }),
      ip: getIp(req),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSuperadminOr401();
  if (error || !session) return error ?? NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const existing = await prisma.adminUser.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  // No permitir eliminarse a sí mismo.
  if (existing.id === session.userId) {
    return NextResponse.json(
      { error: 'No podés eliminar tu propio usuario.' },
      { status: 400 }
    );
  }

  // No permitir eliminar al último superadmin.
  if (existing.role === 'superadmin') {
    const superadminCount = await prisma.adminUser.count({ where: { role: 'superadmin' } });
    if (superadminCount <= 1) {
      return NextResponse.json(
        { error: 'No podés eliminar al único superadmin del sistema.' },
        { status: 400 }
      );
    }
  }

  await prisma.adminUser.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: 'delete_admin_user',
      entity: 'admin_user',
      entityId: params.id,
      metadata: JSON.stringify({ email: existing.email, role: existing.role }),
      ip: getIp(req),
    },
  });

  return NextResponse.json({ ok: true });
}