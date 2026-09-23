'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save } from 'lucide-react';

interface ProfileData {
  phone?: string | null;
  whatsapp?: string | null;
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

interface Props {
  student: ProfileData;
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

export default function ProfileForm({ student }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const body = {
        phone: fd.get('phone') || null,
        whatsapp: fd.get('whatsapp') || null,
        weightKg: fd.get('weightKg') ? Number(fd.get('weightKg')) : null,
        heightCm: fd.get('heightCm') ? Number(fd.get('heightCm')) : null,
        emergencyName: fd.get('emergencyName') || null,
        emergencyPhone: fd.get('emergencyPhone') || null,
        medicalNotes: fd.get('medicalNotes') || null,
        allergies: fd.get('allergies') || null,
        attendanceDaysPerWeek: Number(fd.get('attendanceDaysPerWeek') || 2),
        belt: fd.get('belt') || null,
        notes: fd.get('notes') || null,
        photoDriveFileId: fd.get('photoDriveFileId') || null,
      };
      const res = await fetch('/api/student/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({ error: 'Error' }));
      if (!res.ok) {
        setError(data.error || 'No se pudo guardar el perfil.');
        return;
      }
      setOk(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Teléfono">
          <input name="phone" defaultValue={student.phone ?? ''} className="input" />
        </Field>
        <Field label="WhatsApp (E.164)" hint="Ej: +5493464520203">
          <input
            name="whatsapp"
            defaultValue={student.whatsapp ?? ''}
            className="input"
            placeholder="+549..."
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Peso (kg)">
          <input
            name="weightKg"
            type="number"
            step="0.1"
            min={0}
            max={500}
            defaultValue={student.weightKg ?? ''}
            className="input"
          />
        </Field>
        <Field label="Altura (cm)">
          <input
            name="heightCm"
            type="number"
            min={0}
            max={300}
            defaultValue={student.heightCm ?? ''}
            className="input"
          />
        </Field>
        <Field label="Días por semana" hint="Base para el cálculo de cuota">
          <select
            name="attendanceDaysPerWeek"
            defaultValue={String(student.attendanceDaysPerWeek ?? 2)}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Contacto de emergencia">
          <input
            name="emergencyName"
            defaultValue={student.emergencyName ?? ''}
            className="input"
            placeholder="Nombre y apellido"
          />
        </Field>
        <Field label="Teléfono de emergencia">
          <input
            name="emergencyPhone"
            defaultValue={student.emergencyPhone ?? ''}
            className="input"
          />
        </Field>
      </div>

      <Field label="Cinturón actual">
        <select
          name="belt"
          defaultValue={student.belt ?? ''}
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

      <Field label="Alergias">
        <input
          name="allergies"
          defaultValue={student.allergies ?? ''}
          className="input"
          placeholder="Ninguna conocida"
        />
      </Field>

      <Field label="Notas médicas">
        <textarea
          name="medicalNotes"
          rows={4}
          defaultValue={student.medicalNotes ?? ''}
          className="input resize-y"
          placeholder="Lesiones, medicación, observaciones relevantes"
        />
      </Field>

      <Field label="Notas">
        <textarea
          name="notes"
          rows={3}
          defaultValue={student.notes ?? ''}
          className="input resize-y"
          placeholder="Información adicional"
        />
      </Field>

      <Field label="ID de foto (Google Drive)" hint="Se mostrará en tu perfil y en la tarjeta del alumno">
        <input
          name="photoDriveFileId"
          defaultValue={student.photoDriveFileId ?? ''}
          className="input font-mono text-xs"
          placeholder="1AbC...dEf"
        />
      </Field>

      {error && (
        <p className="rounded-sm border border-shiroi-900/40 bg-shiroi-950/40 px-3 py-2 text-xs text-shiroi-300">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-sm border border-emerald-900/60 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-300">
          Perfil actualizado correctamente.
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando…' : 'Guardar perfil'}
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
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-500">{hint}</p>}
    </div>
  );
}