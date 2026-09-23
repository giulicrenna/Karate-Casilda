'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface ProfileData {
  weightKg?: number | null;
  heightCm?: number | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  medicalNotes?: string | null;
  allergies?: string | null;
  attendanceDaysPerWeek?: number;
  belt?: string | null;
  notes?: string | null;
  photoDriveFileId?: string | null;
}

interface StudentData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dni: string | null;
  phone: string | null;
  whatsapp: string | null;
  birthDate: string | null;
  active: boolean;
  joinedAt: string;
  mustChangePwd: boolean;
  profile: ProfileData | null;
}

interface CertificateItem {
  id: string;
  title: string;
  type: string;
  issuedAt: string;
  driveFileId: string;
  fileMimeType: string;
  fileName: string;
}

type Tab = 'datos' | 'certificados' | 'asistencia' | 'deuda';

const BELT_LABEL: Record<string, string> = {
  blanca: 'Blanca',
  amarilla: 'Amarilla',
  naranja: 'Naranja',
  verde: 'Verde',
  azul: 'Azul',
  marfil: 'Marfil',
  negra: 'Negra',
};

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-AR', { dateStyle: 'medium' });
}

export default function AlumnoDetailTabs({ student }: { student: StudentData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('datos');
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loadingCert, setLoadingCert] = useState(false);
  const [addingCert, setAddingCert] = useState(false);
  const [certForm, setCertForm] = useState({
    title: '',
    type: 'cinturon',
    driveFileId: '',
    fileMimeType: 'application/pdf',
    fileName: '',
    notes: '',
  });
  const [certError, setCertError] = useState<string | null>(null);

  const loadCerts = async () => {
    setLoadingCert(true);
    try {
      const res = await fetch(`/api/alumnos/${student.id}/certificates`);
      const data = await res.json().catch(() => ({ items: [] }));
      setCertificates(data.items ?? []);
    } finally {
      setLoadingCert(false);
    }
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === 'certificados' && certificates.length === 0 && !loadingCert) {
      loadCerts();
    }
  };

  const submitCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertError(null);
    try {
      const res = await fetch(`/api/alumnos/${student.id}/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...certForm,
          notes: certForm.notes || null,
        }),
      });
      const data = await res.json().catch(() => ({ error: 'Error' }));
      if (!res.ok) {
        setCertError(data.error || 'No se pudo crear el certificado.');
        return;
      }
      setCertificates((prev) => [data, ...prev]);
      setAddingCert(false);
      setCertForm({
        title: '',
        type: 'cinturon',
        driveFileId: '',
        fileMimeType: 'application/pdf',
        fileName: '',
        notes: '',
      });
    } catch (err) {
      setCertError(err instanceof Error ? err.message : 'Error');
    }
  };

  const removeCert = async (id: string) => {
    if (!confirm('¿Eliminar este certificado?')) return;
    // No hay endpoint DELETE; hacemos optimistic removal (Fase 4 implementa eliminación).
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-ink-800 mb-5">
        {(
          [
            ['datos', 'Datos'],
            ['certificados', 'Certificados'],
            ['asistencia', 'Asistencia'],
            ['deuda', 'Deuda'],
          ] as Array<[Tab, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTabChange(key)}
            className={`px-4 py-2 text-sm uppercase tracking-wider transition-colors ${
              tab === key
                ? 'border-b-2 border-shiroi-500 text-shiroi-300'
                : 'text-ink-400 hover:text-ink-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'datos' && <DatosTab student={student} />}

      {tab === 'certificados' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-400">
              {certificates.length} certificado{certificates.length === 1 ? '' : 's'}.
            </p>
            <button
              type="button"
              onClick={() => setAddingCert((v) => !v)}
              className="btn-primary text-xs"
            >
              <Plus className="h-4 w-4" />
              {addingCert ? 'Cancelar' : 'Agregar certificado'}
            </button>
          </div>

          {addingCert && (
            <form onSubmit={submitCert} className="card-minimal p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Título">
                  <input
                    required
                    value={certForm.title}
                    onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="Tipo">
                  <select
                    value={certForm.type}
                    onChange={(e) => setCertForm({ ...certForm, type: e.target.value })}
                    className="input"
                  >
                    <option value="cinturon">Cinturón</option>
                    <option value="diploma">Diploma</option>
                    <option value="asistencia">Asistencia</option>
                    <option value="otro">Otro</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Drive File ID">
                  <input
                    required
                    minLength={10}
                    value={certForm.driveFileId}
                    onChange={(e) => setCertForm({ ...certForm, driveFileId: e.target.value })}
                    className="input font-mono text-xs"
                  />
                </Field>
                <Field label="MIME type">
                  <input
                    required
                    value={certForm.fileMimeType}
                    onChange={(e) => setCertForm({ ...certForm, fileMimeType: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="Nombre archivo">
                  <input
                    required
                    value={certForm.fileName}
                    onChange={(e) => setCertForm({ ...certForm, fileName: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>
              <Field label="Notas">
                <textarea
                  rows={2}
                  value={certForm.notes}
                  onChange={(e) => setCertForm({ ...certForm, notes: e.target.value })}
                  className="input resize-y"
                />
              </Field>

              {certError && (
                <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
                  {certError}
                </p>
              )}

              <button type="submit" className="btn-primary text-xs">
                Guardar certificado
              </button>
            </form>
          )}

          {loadingCert ? (
            <p className="text-sm text-ink-400">Cargando…</p>
          ) : certificates.length === 0 ? (
            <div className="card-minimal p-10 text-center text-sm text-ink-400">
              Aún no hay certificados emitidos.
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-ink-800">
              <table className="w-full text-sm">
                <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
                  <tr>
                    <th className="px-4 py-3">Título</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="hidden sm:table-cell px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-900">
                  {certificates.map((c) => (
                    <tr key={c.id} className="hover:bg-ink-900/30">
                      <td className="px-4 py-3 font-display text-ink-100">{c.title}</td>
                      <td className="px-4 py-3 text-ink-300">{c.type}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-ink-400">
                        {fmtDate(c.issuedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeCert(c.id)}
                          className="grid h-8 w-8 place-items-center rounded-sm text-ink-400 hover:bg-shiroi-950 hover:text-shiroi-400"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'asistencia' && (
        <div className="card-minimal p-10 text-center text-sm text-ink-400">
          Próximamente: registro de asistencia por clase.
        </div>
      )}

      {tab === 'deuda' && (
        <div className="card-minimal p-10 text-center text-sm text-ink-400">
          Próximamente: gestión de deudas y pagos del alumno.
        </div>
      )}
    </div>
  );
}

function DatosTab({ student }: { student: StudentData }) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);

  const toggleActive = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/alumnos/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !student.active }),
      });
      if (res.ok) router.refresh();
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <Link href={`/admin/alumnos/${student.id}/editar`} className="btn-secondary text-xs">
          <Pencil className="h-4 w-4" />
          Editar datos
        </Link>
        <button
          type="button"
          onClick={toggleActive}
          disabled={toggling}
          className={`btn-secondary text-xs disabled:opacity-50`}
        >
          {student.active ? 'Desactivar alumno' : 'Reactivar alumno'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailCard title="Identidad">
          <Row k="Nombre" v={`${student.firstName} ${student.lastName}`} />
          <Row k="Email" v={student.email} />
          <Row k="DNI" v={student.dni ?? '—'} />
          <Row k="Fecha de nacimiento" v={fmtDate(student.birthDate)} />
        </DetailCard>
        <DetailCard title="Contacto">
          <Row k="Teléfono" v={student.phone ?? '—'} />
          <Row k="WhatsApp" v={student.whatsapp ?? '—'} />
          <Row k="Ingresó" v={fmtDate(student.joinedAt)} />
          <Row k="Activo" v={student.active ? 'Sí' : 'No'} />
        </DetailCard>
      </div>

      <DetailCard title="Perfil deportivo">
        <Row
          k="Cinturón"
          v={student.profile?.belt ? BELT_LABEL[student.profile.belt] ?? student.profile.belt : '—'}
        />
        <Row
          k="Días por semana"
          v={String(student.profile?.attendanceDaysPerWeek ?? 2)}
        />
        <Row
          k="Peso"
          v={student.profile?.weightKg != null ? `${Number(student.profile.weightKg)} kg` : '—'}
        />
        <Row k="Altura" v={student.profile?.heightCm != null ? `${student.profile.heightCm} cm` : '—'} />
        <Row k="Contacto emergencia" v={student.profile?.emergencyName ?? '—'} />
        <Row k="Tel. emergencia" v={student.profile?.emergencyPhone ?? '—'} />
        <Row k="Alergias" v={student.profile?.allergies ?? '—'} />
      </DetailCard>

      {(student.profile?.medicalNotes || student.profile?.notes) && (
        <DetailCard title="Notas">
          {student.profile?.medicalNotes && (
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-wider text-shiroi-500">Médicas</div>
              <p className="text-sm text-ink-200 whitespace-pre-wrap">
                {student.profile.medicalNotes}
              </p>
            </div>
          )}
          {student.profile?.notes && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-shiroi-500">Generales</div>
              <p className="text-sm text-ink-200 whitespace-pre-wrap">{student.profile.notes}</p>
            </div>
          )}
        </DetailCard>
      )}
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-minimal p-5">
      <h3 className="font-display text-sm text-ink-100 mb-3">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-ink-400">{k}</span>
      <span className="text-ink-100 text-right break-words">{v}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">{label}</label>
      {children}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.125rem;
          border: 1px solid rgb(38 38 38);
          background-color: rgb(10 10 10 / 0.6);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(245 245 245);
        }
        :global(.input:focus) {
          border-color: rgb(185 28 28);
          outline: none;
        }
      `}</style>
    </div>
  );
}