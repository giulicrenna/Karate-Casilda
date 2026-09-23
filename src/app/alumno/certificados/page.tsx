import { requireStudent } from '@/lib/guards';
import { prisma } from '@/lib/db';
import PortalShell from '@/components/alumno/PortalShell';
import CertificateCard from '@/components/alumno/CertificateCard';

export const dynamic = 'force-dynamic';

export default async function AlumnoCertificadosPage() {
  const session = await requireStudent({ allowMustChange: true });

  const [student, certificates] = await Promise.all([
    prisma.student.findUnique({ where: { id: session.studentId } }),
    prisma.certificate.findMany({
      where: { studentId: session.studentId },
      orderBy: { issuedAt: 'desc' },
    }),
  ]);

  const items = certificates.map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type,
    driveFileId: c.driveFileId,
    fileMimeType: c.fileMimeType,
    fileName: c.fileName,
    issuedAt: c.issuedAt.toISOString(),
  }));

  return (
    <PortalShell email={student?.email} mustChangePwd={session.mustChangePwd}>
      <header className="border-b border-ink-800 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Portal del alumno</div>
        <h1 className="font-display text-2xl text-ink-50">Mis certificados</h1>
        <p className="mt-1 text-xs text-ink-500">
          Cinturones, diplomas y constancias emitidas por el dojo.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="card-minimal p-10 text-center text-sm text-ink-400">
          Aún no tenés certificados emitidos.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <CertificateCard key={c.id} cert={c} />
          ))}
        </div>
      )}
    </PortalShell>
  );
}