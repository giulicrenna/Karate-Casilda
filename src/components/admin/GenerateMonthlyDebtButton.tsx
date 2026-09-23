'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wand2 } from 'lucide-react';

export default function GenerateMonthlyDebtButton({
  defaultYear,
  defaultMonth,
}: {
  defaultYear?: number;
  defaultMonth?: number;
}) {
  const router = useRouter();
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState<string>(String(defaultYear ?? today.getFullYear()));
  const [month, setMonth] = useState<string>(String(defaultMonth ?? today.getMonth() + 1));
  const [dryRun, setDryRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/pagos/debts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodYear: Number(year),
          periodMonth: Number(month),
          dryRun,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error' }));
        setError(data.error || 'No se pudo generar las deudas.');
        return;
      }
      const data = await res.json();
      setResult(
        `${dryRun ? 'Vista previa: ' : ''}Generadas: ${data.generated} · Omitidas: ${data.skipped}${
          data.errors.length > 0 ? ` · Errores: ${data.errors.length}` : ''
        }`,
      );
      if (!dryRun) {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-primary text-xs"
      >
        <Wand2 className="h-4 w-4" />
        Generar deudas del mes
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-ink-800 bg-ink-950 p-4 shadow-xl z-20">
          <p className="text-xs text-ink-400 mb-3">
            Genera las deudas para todos los alumnos activos del período seleccionado.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
                Año
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
                Mes
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-sm border border-ink-700 bg-ink-900 px-2 py-1.5 text-xs text-ink-100"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-ink-300 mb-3">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="h-3.5 w-3.5 rounded-sm border-ink-700 bg-ink-900"
            />
            Solo vista previa (no persiste)
          </label>
          {error && <p className="text-xs text-shiroi-400 mb-2">{error}</p>}
          {result && <p className="text-xs text-emerald-400 mb-2">{result}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-secondary text-xs"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={generate}
              disabled={running}
              className="btn-primary text-xs"
            >
              {running ? 'Generando…' : dryRun ? 'Previsualizar' : 'Generar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}