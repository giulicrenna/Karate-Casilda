'use client';

import { useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  fallbackIcon?: React.ReactNode;
}

export default function SafeImage({ fallbackIcon, className, ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={rest.alt ?? 'Imagen no disponible'}
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-ink-900 via-ink-950 to-shiroi-950/30',
          className
        )}
      >
        {fallbackIcon ?? <ImageOff className="h-10 w-10 text-shiroi-700/40" aria-hidden />}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...rest} onError={() => setFailed(true)} className={className} />
  );
}
