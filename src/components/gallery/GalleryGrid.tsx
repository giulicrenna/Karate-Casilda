'use client';

import { useState, useCallback, useEffect } from 'react';
import { Download, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { DrivePhotoDTO } from '@/types';

interface GalleryGridProps {
  photos: DrivePhotoDTO[];
  albumTitle: string;
}

export default function GalleryGrid({ photos, albumTitle }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const current = lightboxIndex !== null ? photos[lightboxIndex] : null;
  const isVideo = current?.mediaType === 'video';

  const close = useCallback(() => setLightboxIndex(null), []);
  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);
  const prev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + photos.length) % photos.length
    );
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, close, next, prev]);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-sm bg-ink-900 focus:outline-none focus:ring-2 focus:ring-shiroi-500 focus:ring-offset-2 focus:ring-offset-ink-950"
            aria-label={`Ver ${p.name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.thumbnailUrl ?? ''}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {p.mediaType === 'video' && (
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-950/70 text-shiroi-300 backdrop-blur-sm border border-shiroi-700/50">
                  <Play className="h-6 w-6 fill-current" />
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-ink-950/95 backdrop-blur-sm flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${lightboxIndex + 1} de ${photos.length}`}
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-ink-800 sm:px-6">
            <div className="text-xs uppercase tracking-wider text-ink-300">
              <span className="text-shiroi-400 tabular-nums">
                {String(lightboxIndex + 1).padStart(3, '0')}
              </span>
              <span className="mx-2 text-ink-600">/</span>
              <span className="tabular-nums">{String(photos.length).padStart(3, '0')}</span>
              <span className="ml-3 text-ink-500 hidden sm:inline truncate max-w-[40ch]">
                {photos[lightboxIndex].name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={photos[lightboxIndex].downloadUrl ?? '#'}
                download
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-sm text-ink-200 hover:bg-ink-800 hover:text-shiroi-400"
                aria-label="Descargar original"
                title="Descargar original"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={close}
                className="grid h-9 w-9 place-items-center rounded-sm text-ink-200 hover:bg-ink-800 hover:text-shiroi-400"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="relative flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden">
            {photos.length > 1 && (
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 sm:left-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-ink-900/80 text-ink-100 backdrop-blur hover:bg-ink-800"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {isVideo ? (
              <video
                key={current!.driveFileId}
                src={current!.viewUrl ?? current!.downloadUrl ?? ''}
                poster={current!.thumbnailUrl ?? undefined}
                controls
                autoPlay
                playsInline
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current!.viewUrl ?? ''}
                alt={current!.name}
                className="max-h-full max-w-full object-contain"
              />
            )}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={next}
                className="absolute right-2 sm:right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-ink-900/80 text-ink-100 backdrop-blur hover:bg-ink-800"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          <footer className="px-4 py-3 border-t border-ink-800 text-center text-xs text-ink-500 sm:px-6">
            {albumTitle} — Las fotografías originales se almacenan en Google Drive y pueden
            descargarse.
          </footer>
        </div>
      )}
    </>
  );
}
