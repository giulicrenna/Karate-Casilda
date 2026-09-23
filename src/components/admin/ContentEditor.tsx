'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Item {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
}

const GROUPED_KEYS: Record<string, { label: string; keys: string[]; multiline?: boolean }> = {
  home: {
    label: 'Inicio',
    keys: [
      'home.hero.title',
      'home.hero.subtitle',
      'home.hero.tagline',
      'home.hero.description',
      'home.values.title',
    ],
    multiline: true,
  },
  dojo: {
    label: 'Dojo',
    keys: [
      'dojo.name',
      'dojo.shortName',
      'dojo.style',
      'dojo.history',
      'dojo.instructors',
      'dojo.location',
      'dojo.schedule',
    ],
    multiline: true,
  },
  contact: {
    label: 'Contacto',
    keys: [
      'contact.address',
      'contact.phone',
      'contact.email',
      'contact.whatsapp',
      'contact.instagram',
      'contact.facebook',
      'contact.hours',
      'contact.mapsUrl',
    ],
  },
  dojoKun: {
    label: 'Dojo Kun (JSON)',
    keys: ['dokun.original', 'dokun.romaji', 'dokun.spanish', 'dokun.principles'],
    multiline: true,
  },
  skif: {
    label: 'SKIF',
    keys: ['skif.affiliation'],
    multiline: true,
  },
  historia: {
    label: 'Historia local',
    keys: ['historia.custom'],
    multiline: true,
  },
};

export default function ContentEditor({ items }: { items: Item[] }) {
  const router = useRouter();
  const byKey = new Map(items.map((i) => [i.key, i]));
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const k of Object.values(GROUPED_KEYS).flatMap((g) => g.keys)) o[k] = byKey.get(k)?.value ?? '';
    return o;
  });

  const onSave = async (key: string) => {
    setSaving(key);
    setSaved(null);
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: values[key] ?? '' }),
      });
      if (!res.ok) {
        alert('No se pudo guardar.');
        return;
      }
      setSaved(key);
      setTimeout(() => setSaved(null), 2500);
      router.refresh();
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {Object.entries(GROUPED_KEYS).map(([groupId, group]) => (
        <section key={groupId} className="card-minimal p-5">
          <h2 className="font-display text-base text-ink-100 mb-1">{group.label}</h2>
          <p className="text-xs text-ink-500 mb-4">Editá cada campo y guardá individualmente.</p>
          <div className="space-y-4">
            {group.keys.map((key) => (
              <div key={key}>
                <label className="block text-[11px] font-mono text-ink-500 mb-1">{key}</label>
                {group.multiline ? (
                  <textarea
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    rows={key.includes('description') || key.includes('history') || key.includes('custom') || key.includes('principles') ? 5 : 2}
                    className="input"
                  />
                ) : (
                  <input
                    type="text"
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    className="input"
                  />
                )}
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onSave(key)}
                    disabled={saving === key}
                    className="btn-secondary text-[11px]"
                  >
                    <Save className="h-3 w-3" />
                    {saving === key ? 'Guardando…' : 'Guardar'}
                  </button>
                  {saved === key && (
                    <span className="text-[11px] text-emerald-400">✓ Guardado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="text-xs text-ink-500 italic">
        💡 Para campos que almacenan JSON (como <code>dokun.principles</code>), mantené el formato
        JSON válido.
      </p>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.125rem;
          border: 1px solid rgb(38 38 38);
          background-color: rgb(10 10 10 / 0.6);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(245 245 245);
          font-family: inherit;
        }
        :global(.input:focus) {
          border-color: rgb(185 28 28);
          outline: none;
        }
      `}</style>
    </div>
  );
}
