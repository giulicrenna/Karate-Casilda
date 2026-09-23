import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
}

export default function Hero({ title, subtitle, tagline, description }: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden min-h-[88vh] flex items-center">
      {/* Background image */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero.png)' }}
        aria-hidden
      />
      {/* Dark base wash for text legibility */}
      <div className="absolute inset-0 -z-10 bg-ink-950/70" aria-hidden />
      {/* Left-to-right gradient: keeps text area dark, lets the right side breathe */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(90deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.55) 35%, rgba(10,10,10,0.2) 70%, rgba(10,10,10,0.35) 100%)',
        }}
        aria-hidden
      />
      {/* Subtle noise */}
      <div className="absolute inset-0 -z-10 bg-noise opacity-[0.04] mix-blend-overlay" aria-hidden />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-shiroi-600" aria-hidden />
            <span className="eyebrow">{subtitle}</span>
          </div>

          <h1 className="h-display mt-6 text-balance text-ink-50">
            {title}
            <span className="block mt-2 text-shiroi-500">{tagline}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg text-pretty">
            {description}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/historia" className="btn-primary">
              Conocé el dojo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contacto" className="btn-secondary">
              Sumate
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink-950" aria-hidden />
    </section>
  );
}
