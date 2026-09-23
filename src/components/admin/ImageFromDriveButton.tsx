'use client';

import { useState } from 'react';
import { ImageIcon, Check, X } from 'lucide-react';

interface Props {
  onInsert: (fileId: string, alt: string) => void;
}

export default function ImageFromDriveButton({ onInsert }: Props) {
  const [open, setOpen] = useState(false);
  const [fileId, setFileId] = useState('');
  const [alt, setAlt] = useState('');

  const reset = () => {
    setFileId('');
    setAlt('');
    setOpen(false);
  };

  const submit = () => {
    const cleanId = fileId.trim();
    if (!cleanId) return;
    onInsert(cleanId, alt.trim());
    reset();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-sm border border-ink-700 px-3 py-1.5 text-xs uppercase tracking-wider text-ink-100 transition-colors hover:border-ink-500 hover:bg-ink-900"
      >
        <ImageIcon className="h-3.5 w-3.5" />
        Insertar imagen desde Drive
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          onClick={reset}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-md border border-ink-800 bg-ink-950 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base text-ink-50">Insertar imagen desde Drive</h3>
              <button
                type="button"
                onClick={reset}
                className="grid h-7 w-7 place-items-center rounded-sm text-ink-400 hover:bg-ink-800 hover:text-ink-100"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-400 mb-1">
                  ID del archivo *
                </label>
                <input
                  type="text"
                  value={fileId}
                  onChange={(e) => setFileId(e.target.value)}
                  className="input font-mono text-xs"
                  placeholder="1AbCdEf... (sacalo de la URL de Drive)"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-400 mb-1">
                  Texto alternativo
                </label>
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  className="input"
                  placeholder="Descripción de la imagen"
                />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-ink-500">
              Se insertará <code className="text-shiroi-400">![alt](drive:ID)</code> en el cuerpo. La imagen
              se sirve por el proxy al publicar.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" onClick={reset} className="btn-secondary text-xs">
                Cancelar
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!fileId.trim()}
                className="btn-primary text-xs"
              >
                <Check className="h-3.5 w-3.5" />
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}