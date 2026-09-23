import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { StudentCreateSchema } from '@/lib/validation';

export const runtime = 'nodejs';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function GET(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  const activeParam = url.searchParams.get('active');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10) || 0, 0);

  const where: Record<string, unknown> = {};
  if (activeParam === 'true') where.active = true;
  if (activeParam === 'false') where.active = false;

  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { dni: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: limit,
      skip: offset,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dni: true,
        phone: true,
        active: true,
        joinedAt: true,
        mustChangePwd: true,
        profile: {
          select: { attendanceDaysPerWeek: true, belt: true, photoDriveFileId: true },
        },
      },
    }),
    prisma.student.count({ where }),
  ]);

  return NextResponse.json({ items, total });
}

export async function POST(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = StudentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const email = data.email.toLowerCase().trim();
  const existing = await prisma.student.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Ya existe un alumno con ese email.' }, { status: 409 });
  }

  if (data.dni) {
    const existingDni = await prisma.student.findUnique({ where: { dni: data.dni } });
    if (existingDni) {
      return NextResponse.json({ error: 'Ya existe un alumno con ese DNI.' }, { status: 409 });
    }
  }

  const passwordHash = await bcrypt.hash(data.initialPassword, 12);

  const created = await prisma.student.create({
    data: {
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni ?? null,
      phone: data.phone ?? null,
      whatsapp: data.whatsapp && data.whatsapp.length > 0 ? data.whatsapp : null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      active: data.active,
      mustChangePwd: data.mustChangePwd,
      passwordHash,
      profile: {
        create: {
          weightKg: data.weightKg ?? null,
          heightCm: data.heightCm ?? null,
          emergencyName: data.emergencyName ?? null,
          emergencyPhone: data.emergencyPhone ?? null,
          medicalNotes: data.medicalNotes ?? null,
          allergies: data.allergies ?? null,
          attendanceDaysPerWeek: data.attendanceDaysPerWeek,
          belt: data.belt ?? null,
          notes: data.notes ?? null,
        },
      },
    },
    include: { profile: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'create_student',
      entity: 'student',
      entityId: created.id,
      metadata: JSON.stringify({ email: created.email }),
      ip: getIp(req),
    },
  });

  return NextResponse.json(created, { status: 201 });
}