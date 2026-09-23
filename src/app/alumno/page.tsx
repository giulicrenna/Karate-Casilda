import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Award, User, Wallet } from 'lucide-react';
import { requireStudent } from '@/lib/guards';
import { prisma } from '@/lib/db';
import PortalShell from '@/components/alumno/PortalShell';
import { formatARS } from '@/lib/money';

export const dynamic = 'force-dynamic';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export default async function AlumnoDashboard() {
  const session = await requireStudent({ allowMustChange: true });
  if (session.mustChangePwd) redirect('/alumno/cambiar-password');

  const [student, debts, certificates] = await Promise.all([
    prisma.student.findUnique({
      where: { id: session.studentId },
      include: { profile: true },
    }),
    prisma.debt.findMany({
      where: { studentId: session.studentId },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    }),
    prisma.certificate.count({ where: { studentId: session.studentId } }),
  ]);

  const totalPending = debts
    .filter((d) => d.status !== 'paid' && d.status !== 'cancelled')
    .reduce((acc, d) => acc + Number(d.totalAmount) - Number(d.paidAmount), 0);

  // Próximo vencimiento: la primer deuda pendiente o vencida con dueDate >= hoy.
  const now = new Date();
  const nextDue = debts
    .filter((d) => d.status !== 'paid' && d.status !== 'cancelled' && d.dueDate >= now)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

  return (
    <PortalShell email={student?.email} mustChangePwd={session.mustChangePwd}>
      <header className="border-b border-ink-800 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">Portal del alumno</div>
        <h1 className="font-display text-2xl text-ink-50">
          ¡Hola, {student?.firstName ?? 'alumno'}!
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          Acá podés revisar tu perfil, deudas y certificados.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          icon={<Wallet className="h-5 w-5" />}
          label="Deuda pendiente"
          value={formatARS(totalPending)}
          href="/alumno/deuda"
        />
        <SummaryCard
          icon={<Award className="h-5 w-5" />}
          label="Certificados"
          value={String(certificates)}
          href="/alumno/certificados"
        />
        <SummaryCard
          icon={<User className="h-5 w-5" />}
          label="Mi perfil"
          value={student?.profile ? 'Completo' : 'Incompleto'}
          href="/alumno/perfil"
        />
      </div>

      {nextDue && (
        <div className="mt-8 card-minimal p-5">
          <div className="text-xs uppercase tracking-wider text-shiroi-500">Próximo vencimiento</div>
          <div className="mt-2 font-display text-lg text-ink-50">
            {MONTHS[nextDue.periodMonth - 1]} {nextDue.periodYear}
          </div>
          <div className="text-sm text-ink-300">
            Vence el{' '}
            <strong>
              {new Date(nextDue.dueDate).toLocaleDateString('es-AR', { dateStyle: 'long' })}
            </strong>{' '}
            · {formatARS(Number(nextDue.totalAmount) - Number(nextDue.paidAmount))} pendiente
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-base text-ink-100 mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickLink href="/alumno/perfil" title="Editar mi perfil" desc="Peso, contacto, cinturón" />
          <QuickLink href="/alumno/deuda" title="Ver mis deudas" desc="Estado y montos" />
          <QuickLink href="/alumno/certificados" title="Mis certificados" desc="Cinturones y diplomas" />
        </div>
      </div>
    </PortalShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href} className="card-minimal p-5 block">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-shiroi-500">{label}</div>
        <div className="text-shiroi-600">{icon}</div>
      </div>
      <div className="mt-3 font-display text-2xl text-ink-50">{value}</div>
    </Link>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="card-minimal p-4 flex items-center gap-3 hover:border-shiroi-700"
    >
      <div>
        <div className="font-display text-sm text-ink-100">{title}</div>
        <div className="text-xs text-ink-500">{desc}</div>
      </div>
    </Link>
  );
}