import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const runtime = 'nodejs';

const CertificateCreateSchema = z.object({
  title: z.string().min(2).max(160),
  type: z.enum(['cinturon', 'diploma', 'asistencia', 'otro']),
  driveFileId: z.string().min(10).max(200),
  fileMimeType: z.string().min(3).max(120),
  fileName: z.string().min(1).max(260),
  notes: z.string().max(2000).optional().nullable(),
  issuedAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida')
    .optional(),
});

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const student = await prisma.student.findUnique({ where: { id: params.id } });
  if (!student) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const items = await prisma.certificate.findMany({
    where: { studentId: params.id },
    orderBy: { issuedAt: 'desc' },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const student = await prisma.student.findUnique({ where: { id: params.id } });
  if (!student) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = CertificateCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const created = await prisma.certificate.create({
    data: {
      studentId: params.id,
      title: data.title,
      type: data.type,
      driveFileId: data.driveFileId,
      fileMimeType: data.fileMimeType,
      fileName: data.fileName,
      notes: data.notes ?? null,
      issuedAt: data.issuedAt ? new Date(data.issuedAt) : new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: s.userId,
      action: 'create_certificate',
      entity: 'certificate',
      entityId: created.id,
      metadata: JSON.stringify({ studentId: params.id, title: data.title }),
      ip: getIp(req),
    },
  });

  return NextResponse.json(created, { status: 201 });
}