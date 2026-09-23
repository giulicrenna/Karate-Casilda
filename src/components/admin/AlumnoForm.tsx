'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save } from 'lucide-react';

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
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dni?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  birthDate?: string | null;
  active?: boolean;
  mustChangePwd?: boolean;
  profile?: ProfileData | null;
}

interface Props {
  mode: 'create' | 'edit';
  studentId?: string;
  initial?: StudentData;
}

const BELTS = [
  { value: 'blanca', label: 'Blanca' },
  { value: 'amarilla', label: 'Amarilla' },
  { value: 'naranja', label: 'Naranja' },
  { value: 'verde', label: 'Verde' },
  { value: 'azul', label: 'Azul' },
  { value: 'marfil', label: 'Marfil' },
  { value: 'negra', label: 'Negra' },
];

function toDateInput(value: string | null | undefined) {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export default function AlumnoForm({ mode, studentId, initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);

      const emptyToNull = (v: FormDataEntryValue | null) => {
        const s = (v ?? '').toString().trim();
        return s.length === 0 ? null : s;
      };
      const emptyNum = (v: FormDataEntryValue | null) => {
        const s = (v ?? '').toString().trim();
        return s.length === 0 ? null : Number(s);
      };

      const body: Record<string, unknown> = {
        firstName: fd.get('firstName'),
        lastName: fd.get('lastName'),
        email: (fd.get('email') as string | null)?.toLowerCase(),
        dni: emptyToNull(fd.get('dni')),
        phone: emptyToNull(fd.get('phone')),
        whatsapp: emptyToNull(fd.get('whatsapp')),
        birthDate: fd.get('birthDate') ? new Date(String(fd.get('birthDate'))).toISOString() : null,
        weightKg: emptyNum(fd.get('weightKg')),
        heightCm: emptyNum(fd.get('heightCm')),
        emergencyName: emptyToNull(fd.get('emergencyName')),
        emergencyPhone: emptyToNull(fd.get('emergencyPhone')),
        medicalNotes: emptyToNull(fd.get('medicalNotes')),
        allergies: emptyToNull(fd.get('allergies')),
        attendanceDaysPerWeek: Number(fd.get('attendanceDaysPerWeek') || 2),
        belt: emptyToNull(fd.get('belt')),
        notes: emptyToNull(fd.get('notes')),
        photoDriveFileId: emptyToNull(fd.get('photoDriveFileId')),
      };

      const isCreate = mode === 'create';
      if (isCreate) {
        body.initialPassword = fd.get('initialPassword');
        body.mustChangePwd = fd.get('mustChangePwd') === 'on';
        body.active = fd.get('active') !== 'off';
      } else {
        body.active = fd.get('active') !== 'off';
      }

      const url = isCreate ? '/api/alumnos' : `/api/alumnos/${studentId}`;
      const method = isCreate ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({ error: 'Error' }));
      if (!res.ok) {
        setError(data.error || 'No se pudo guardar.');
        return;
      }
      router.push(isCreate ? `/admin/alumnos/${data.id}` : '/admin/alumnos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-4xl">
      <section className="card-minimal p-5">
        <h2 className="font-display text-base text-ink-100 mb-4">Datos personales</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre" required>
            <input
              name="firstName"
              required
              defaultValue={initial?.firstName}
              className="input"
            />
          </Field>
          <Field label="Apellido" required>
            <input
              name="lastName"
              required
              defaultValue={initial?.lastName}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
          <Field label="Email" required>
            <input
              name="email"
              type="email"
              required
              defaultValue={initial?.email}
              className="input"
            />
          </Field>
          <Field label="DNI">
            <input name="dni" defaultValue={initial?.dni ?? ''} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
          <Field label="Teléfono">
            <input name="phone" defaultValue={initial?.phone ?? ''} className="input" />
          </Field>
          <Field label="WhatsApp (E.164)">
            <input
              name="whatsapp"
              defaultValue={initial?.whatsapp ?? ''}
              className="input"
              placeholder="+549..."
            />
          </Field>
          <Field label="Fecha de nacimiento">
            <input
              name="birthDate"
              type="date"
              defaultValue={toDateInput(initial?.birthDate)}
              className="input"
            />
          </Field>
        </div>
      </section>

      {mode === 'create' && (
        <section className="card-minimal p-5">
          <h2 className="font-display text-base text-ink-100 mb-4">Credenciales</h2>
          <Field label="Contraseña inicial" required hint="El alumno deberá cambiarla al primer ingreso.">
            <input
              name="initialPassword"
              type="text"
              required
              minLength={8}
              className="input"
              placeholder="Mínimo 8 caracteres"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink-200 mt-4">
            <input
              name="mustChangePwd"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded-sm border-ink-700 bg-ink-900"
            />
            Forzar cambio de contraseña en el primer ingreso
          </label>
        </section>
      )}

      <section className="card-minimal p-5">
        <h2 className="font-display text-base text-ink-100 mb-4">Perfil deportivo</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Peso (kg)">
            <input
              name="weightKg"
              type="number"
              step="0.1"
              min={0}
              max={500}
              defaultValue={initial?.profile?.weightKg ?? ''}
              className="input"
            />
          </Field>
          <Field label="Altura (cm)">
            <input
              name="heightCm"
              type="number"
              min={0}
              max={300}
              defaultValue={initial?.profile?.heightCm ?? ''}
              className="input"
            />
          </Field>
          <Field label="Días por semana" hint="Base para el cálculo de cuota">
            <select
              name="attendanceDaysPerWeek"
              defaultValue={String(initial?.profile?.attendanceDaysPerWeek ?? 2)}
              className="input"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'día' : 'días'}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
          <Field label="Contacto de emergencia">
            <input
              name="emergencyName"
              defaultValue={initial?.profile?.emergencyName ?? ''}
              className="input"
            />
          </Field>
          <Field label="Teléfono de emergencia">
            <input
              name="emergencyPhone"
              defaultValue={initial?.profile?.emergencyPhone ?? ''}
              className="input"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Cinturón actual">
            <select
              name="belt"
              defaultValue={initial?.profile?.belt ?? ''}
              className="input max-w-xs"
            >
              <option value="">— Sin especificar —</option>
              {BELTS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="ID foto (Drive)">
            <input
              name="photoDriveFileId"
              defaultValue={initial?.profile?.photoDriveFileId ?? ''}
              className="input font-mono text-xs"
              placeholder="1AbC...dEf"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Alergias">
            <input
              name="allergies"
              defaultValue={initial?.profile?.allergies ?? ''}
              className="input"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Notas médicas">
            <textarea
              name="medicalNotes"
              rows={3}
              defaultValue={initial?.profile?.medicalNotes ?? ''}
              className="input resize-y"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Notas internas">
            <textarea
              name="notes"
              rows={2}
              defaultValue={initial?.profile?.notes ?? ''}
              className="input resize-y"
            />
          </Field>
        </div>
      </section>

      <section className="card-minimal p-5">
        <h2 className="font-display text-base text-ink-100 mb-4">Estado</h2>
        <label className="flex items-center gap-2 text-sm text-ink-200">
          <input
            name="active"
            type="checkbox"
            defaultChecked={initial?.active ?? true}
            className="h-4 w-4 rounded-sm border-ink-700 bg-ink-900"
          />
          Alumno activo
        </label>
      </section>

      {error && (
        <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando…' : mode === 'create' ? 'Crear alumno' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>

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
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
        {label} {required && <span className="text-shiroi-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-500">{hint}</p>}
    </div>
  );
}