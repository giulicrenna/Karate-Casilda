import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Trophy } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import SafeImage from '@/components/ui/SafeImage';

const CATEGORY_LABELS: Record<string, string> = {
  torneo: 'Torneo',
  examen: 'Examen',
  seminario: 'Seminario',
  exhibicion: 'Exhibición',
  entrenamiento: 'Entrenamiento',
  otro: 'Evento',
};

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    date: Date | string;
    location: string | null;
    description: string;
    category: string;
    coverImage: string | null;
    featured: boolean;
    album: { id: string; slug: string; title: string } | null;
  };
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group card-minimal flex flex-col overflow-hidden"
    >
      {event.coverImage && !compact && (
        <div className="relative aspect-[16/9] overflow-hidden bg-ink-900">
          <SafeImage
            src={event.coverImage}
            alt={event.title}
            loading="lazy"
            fallbackIcon={<Trophy className="h-12 w-12 text-shiroi-700/40" aria-hidden />}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow text-shiroi-500">
            {CATEGORY_LABELS[event.category] ?? event.category}
          </span>
          {event.featured && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-shiroi-600">
              Destacado
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-lg leading-tight text-ink-100 group-hover:text-shiroi-400 transition-colors">
          {event.title}
        </h3>
        {!compact && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-400">{event.description}</p>
        )}
        <div className="mt-4 flex flex-col gap-1.5 text-xs text-ink-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-shiroi-600" />
            <time dateTime={new Date(event.date).toISOString()}>
              {formatDate(event.date)}
            </time>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-shiroi-600" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-shiroi-500">
          <span className="uppercase tracking-wider">Ver detalle</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
