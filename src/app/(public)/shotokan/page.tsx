import type { Metadata } from 'next';
import SectionHeader from '@/components/sections/SectionHeader';
import { SHOTOKAN_KATA } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Shotokan — el estilo',
  description:
    'El Shotokan: características del estilo, kihon, kata y kumite. Una guía introductoria al karate de Funakoshi.',
};

export default function ShotokanPage() {
  return (
    <>
      <PageHeader
        eyebrow="El estilo"
        title="Shotokan"
        subtitle="Kihon. Kata. Kumite. Tres pilares de un mismo camino."
      />

      <section className="section">
        <SectionHeader
          title="Características del estilo"
          description="El Shotokan es el estilo de karate más practicado del mundo. Se distingue por su profundidad técnica, su elegancia formal y su rigor en la postura."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              kanji: '基',
              word: 'Kihon',
              romaji: 'きほん',
              desc: 'Las técnicas básicas — golpes, bloqueos, patadas y posiciones — ejecutadas con precisión, equilibrio y kime. Es el alfabeto del karate.',
            },
            {
              kanji: '型',
              word: 'Kata',
              romaji: 'かた',
              desc: 'Las formas preestablecidas. Secuencias codificadas de movimientos que condensan la técnica, estrategia y filosofía del estilo.',
            },
            {
              kanji: '組',
              word: 'Kumite',
              romaji: 'くみて',
              desc: 'El combate. Aplicación dinámica del kihon y el kata contra un oponente real. Exige lectura, distancia y timing.',
            },
          ].map((p) => (
            <div key={p.word} className="card-minimal p-7 text-center">
              <div className="font-display text-6xl text-shiroi-600 mb-3" aria-hidden>
                {p.kanji}
              </div>
              <div className="eyebrow mb-1">{p.romaji}</div>
              <h3 className="font-display text-xl text-ink-100">{p.word}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section border-t border-ink-900">
        <SectionHeader
          title="Posturas y posiciones fundamentales"
          description="Las posiciones básicas que dan estructura a todas las técnicas del Shotokan."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { name: 'Heisoku-dachi', romaji: '閉足立', desc: 'Pies juntos' },
            { name: 'Musubi-dachi', romaji: '結び立', desc: 'Saludo formal' },
            { name: 'Hachiji-dachi', romaji: '八字立', desc: 'Natural' },
            { name: 'Zenkutsu-dachi', romaji: '前屈立', desc: 'Frontal' },
            { name: 'Kokutsu-dachi', romaji: '後屈立', desc: 'Atrasada' },
            { name: 'Kiba-dachi', romaji: '騎馬立', desc: 'Jinete' },
            { name: 'Fudō-dachi', romaji: '不動立', desc: 'Enraizada' },
            { name: 'Sanchin-dachi', romaji: '三戦立', desc: 'Reloj de arena' },
          ].map((p) => (
            <div key={p.name} className="card-minimal p-4">
              <div className="font-display text-base text-ink-100">{p.name}</div>
              <div className="text-xs text-ink-500 mt-0.5">{p.romaji}</div>
              <div className="text-xs text-shiroi-500 mt-2">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section border-t border-ink-900">
        <SectionHeader
          eyebrow="Patrimonio"
          title={`${SHOTOKAN_KATA.length} kata`}
          description="La lista canónica del Shotokan incluye kata de distintos niveles de complejidad. Los Heian y Tekki son la base; los kata avanzados exigen años de práctica."
        />

        <div className="mt-10 overflow-hidden rounded-md border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="hidden sm:table-cell px-4 py-3">Significado</th>
                <th className="hidden md:table-cell px-4 py-3">Movimientos</th>
                <th className="px-4 py-3">Nivel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900">
              {SHOTOKAN_KATA.map((k) => (
                <tr key={k.number} className="hover:bg-ink-900/30 transition-colors">
                  <td className="px-4 py-3 text-ink-500 tabular-nums">{k.number}</td>
                  <td className="px-4 py-3">
                    <div className="font-display text-ink-100">{k.name}</div>
                    <div className="text-xs text-ink-500">{k.kanji}</div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-ink-300">{k.meaning}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-ink-400 tabular-nums">
                    {k.movements}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider ' +
                        (k.level === 'básico'
                          ? 'bg-shiroi-900/30 text-shiroi-400'
                          : k.level === 'intermedio'
                          ? 'bg-steel-600/30 text-steel-400'
                          : k.level === 'avanzado'
                          ? 'bg-ink-700 text-ink-200'
                          : 'bg-shiroi-950 text-shiroi-300')
                      }
                    >
                      {k.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section border-t border-ink-900">
        <SectionHeader
          title="El concepto de Kime"
          description="Lo que distingue un movimiento largo de un golpe cortante."
        />
        <div className="mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-ink-300">
          <p>
            <strong className="text-ink-100">Kime</strong> (決め) es el instante exacto en que la
            técnica alcanza su máximo potencial: la coordinación simultánea de respiración,
            tensión muscular, foco visual y propósito.
          </p>
          <p>
            Sin kime, el karate se convierte en gimnasia. Es el momento en que el cuerpo entero se
            integra en un solo punto de impacto. En el Shotokan, este concepto se entrena desde el
            primer día, primero en kihon, después en kata, finalmente en kumite.
          </p>
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
