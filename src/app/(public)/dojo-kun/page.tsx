import type { Metadata } from 'next';
import SectionHeader from '@/components/sections/SectionHeader';
import { DEFAULT_DOJO_KUN } from '@/lib/constants';
import { getContent } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Dojo Kun — los cinco principios',
  description:
    'El Dojo Kun: cinco máximas atribuidas a Gichin Funakoshi que guían la práctica diaria del karate.',
};

export default async function DojoKunPage() {
  const customPrinciplesJson = await getContent('dokun.principles', '');
  let principles = DEFAULT_DOJO_KUN;
  if (customPrinciplesJson) {
    try {
      const parsed = JSON.parse(customPrinciplesJson);
      if (Array.isArray(parsed) && parsed.length === 5) {
        principles = parsed;
      }
    } catch {
      // keep defaults
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="道場訓"
        title="Dojo Kun"
        subtitle="Los cinco principios del dojo"
      />

      <section className="section">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            eyebrow="Introducción"
            title="Cinco principios, una sola jerarquía"
            description="Cada línea comienza con 「一」 (hitotsu), que significa «uno». Este uso deliberado indica que ningún precepto está por encima de otro: todos son igualmente importantes."
          />

          <div className="mt-12 space-y-8">
            {principles.map((p, idx) => (
              <article
                key={p.number}
                className="card-minimal p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                <div className="md:col-span-2 flex md:flex-col items-start md:items-center gap-3 md:gap-1">
                  <span className="font-display text-6xl text-shiroi-700 leading-none tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="md:col-span-10">
                  <div className="font-display text-2xl sm:text-3xl text-shiroi-300 leading-tight mb-1">
                    {p.translation}
                  </div>
                  <div className="text-xs text-ink-500 italic mb-4">{p.romaji}</div>
                  <div className="font-display text-xl text-ink-100 leading-relaxed mb-4 border-l-2 border-shiroi-700 pl-4">
                    {p.original}
                  </div>
                  <p className="text-base leading-relaxed text-ink-300">{p.explanation}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-t border-ink-900 bg-ink-950">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            title="Nijū Kun — Los veinte preceptos"
            description="Además del Dojo Kun, Funakoshi dejó los veinte preceptos del karate como guía filosófica completa para el practicante."
          />

          <ol className="mt-10 space-y-4 text-sm leading-relaxed text-ink-300">
            {[
              'El karate comienza con el respeto y termina con el respeto.',
              'No hay primer ataque en karate.',
              'El karate es un aliado de la justicia.',
              'Primero concédete a ti mismo, después a los demás.',
              'El espíritu del karate es como el agua: si está tranquilo, refleja; si hierve, se derrite.',
              'El mal se vence con el bien; lo rápido con lo lento; lo duro con lo blando.',
              'Todo lo que te ocurre es consecuencia de tus acciones.',
              'El karate se entrena no solo en el dojo, sino en la vida cotidiana.',
              'No busques el karate en otras cosas: búscalo dentro de ti.',
              'El mal se vence con el bien.',
              'El karate es como el agua caliente en una taza fría: si no le das calor continuamente, se enfría.',
              'No pienses en ganar; piensa en no perder.',
              'Transforma tu cuerpo según el espíritu del karate.',
              'Cuida tus manos y pies con los que golpeas, defiendes y vives.',
              'Considera al adversario como parte de ti mismo.',
              'Busca la perfección del carácter en ti antes que en los demás.',
              'Las técnicas tienen inicio y final; el camino marcial no.',
              'Cuando alcances el viejo nivel, busca uno nuevo.',
              'El secreto del karate está en el entrenamiento diario.',
              'Siempre piensa en los principios del karate y vive en ellos.',
            ].map((p, i) => (
              <li key={i} className="grid grid-cols-12 gap-3 border-b border-ink-900 pb-3">
                <span className="col-span-2 sm:col-span-1 font-display text-shiroi-700 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="col-span-10 sm:col-span-11 italic">{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="relative isolate overflow-hidden border-b border-ink-900 bg-gradient-to-b from-ink-950 to-ink-950 pt-32 pb-16">
      <div className="absolute inset-0 -z-10 opacity-20" aria-hidden>
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-shiroi-900 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-12 bg-shiroi-600" aria-hidden />
          <span className="eyebrow">{eyebrow}</span>
        </div>
        <h1 className="mt-4 h-section text-balance text-ink-50">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-400">{subtitle}</p>
      </div>
    </header>
  );
}
