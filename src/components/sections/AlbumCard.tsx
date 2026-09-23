'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Images, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AlbumCardProps {
  album: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    date: Date | string;
    photoCount: number;
    coverImageId: string | null;
    featured: boolean;
  };
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = album.coverImageId && !imgFailed;

  return (
    <Link
      href={`/galeria/${album.slug}`}
      className="group card-minimal overflow-hidden"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-900">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/thumb/${album.coverImageId}?size=800`}
            alt={album.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-900 to-ink-950">
            <Images className="h-12 w-12 text-ink-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-base leading-tight text-ink-50 line-clamp-2 group-hover:text-shiroi-400 transition-colors">
            {album.title}
          </h3>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {formatDate(album.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Images className="h-3 w-3" />
              {album.photoCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
