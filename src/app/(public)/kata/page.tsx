import type { Metadata } from 'next';
import SectionHeader from '@/components/sections/SectionHeader';
import { SHOTOKAN_KATA, DEFAULT_DOJO_KUN } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Kata — las formas del Shotokan',
  description:
    'Los kata del Shotokan: qué son, su importancia en la práctica y la lista de los kata canónicos del estilo.',
};

export default function KataPage() {
  const levels: Array<{ key: 'introductorio' | 'básico' | 'intermedio' | 'avanzado'; label: string; description: string }> = [
    { key: 'introductorio', label: 'Introductorios', description: 'Diseñados como primer contacto con la forma.' },
    { key: 'básico', label: 'Básicos', description: 'La columna vertebral de cualquier programa Shotokan.' },
    { key: 'intermedio', label: 'Intermedios', description: 'Exigen mayor complejidad técnica y fluidez.' },
    { key: 'avanzado', label: 'Avanzados', description: 'Años de práctica para acceder a su profundidad.' },
  ];

  return (
    <>
      <PageHeader
        eyebrow="型"
        title="Kata"
        subtitle="Las formas codificadas del karate"
      />

      <section className="section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <SectionHeader
              title="¿Qué es un kata?"
              description="Una secuencia formal de movimientos que codifica, en un solo flujo, decenas o cientos de decisiones técnicas contra múltiples oponentes imaginarios."
            />
            <div className="mt-8 space-y-4 text-base leading-relaxed text-ink-300">
              <p>
                El kata es el patrimonio técnico del karate. En él se concentra la tradición
                okinawense: técnicas de mano, patada, bloqueo, esquiva y proyección ejecutadas en
                patrones precisos que se transmiten de generación en generación.
              </p>
              <p>
                Cada kata tiene un <strong className="text-ink-100">bunkai</strong> — la
                interpretación de sus aplicaciones — que puede variar entre organizaciones y
                escuelas. Lo esencial no es solo ejecutar las formas correctamente, sino comprender
                su lógica interna.
              </p>
              <p>
                En el dojo practicamos kata como una herramienta para el{' '}
                <strong className="text-ink-100">autoconocimiento</strong>: cada ejecución revela
                nuestro estado físico, mental y emocional del día.
              </p>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="card-minimal p-6">
              <div className="eyebrow mb-3">Importancia</div>
              <h3 className="font-display text-xl text-ink-100 mb-4">¿Por qué kata?</h3>
              <ul className="space-y-3 text-sm text-ink-300">
                {[
                  'Codifica la técnica completa del estilo.',
                  'Entrena la concentración y la memoria corporal.',
                  'Desarrolla el control respiratorio y el kime.',
                  'Permite practicar sin compañero.',
                  'Transmite la tradición y el linaje del dojo.',
                  'Conecta cuerpo, mente y espíritu en un solo movimiento.',
                ].map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-shiroi-500" aria-hidden />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section border-t border-ink-900">
        <SectionHeader
          title="Lista de kata del Shotokan"
          description="Los 27 kata canónicos del estilo, organizados por nivel de complejidad."
        />

        <div className="mt-12 space-y-12">
          {levels.map((lvl) => {
            const list = SHOTOKAN_KATA.filter((k) => k.level === lvl.key);
            if (list.length === 0) return null;
            return (
              <div key={lvl.key}>
                <div className="flex items-baseline justify-between border-b border-ink-900 pb-3 mb-6">
                  <h3 className="font-display text-xl text-ink-100">{lvl.label}</h3>
                  <span className="text-xs text-ink-500 uppercase tracking-wider">
                    {list.length} kata
                  </span>
                </div>
                <p className="text-sm text-ink-400 mb-5">{lvl.description}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((k) => (
                    <article key={k.number} className="card-minimal p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-display text-lg text-ink-100">{k.name}</div>
                          <div className="text-xs text-ink-500 mt-0.5">{k.kanji}</div>
                        </div>
                        <span className="font-display text-2xl text-shiroi-700 tabular-nums">
                          {String(k.number).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-ink-300">{k.meaning}</p>
                      <div className="mt-3 flex items-center gap-4 text-[11px] text-ink-500">
                        <span>{k.movements} movimientos</span>
                        {k.notes && (
                          <>
                            <span>·</span>
                            <span className="line-clamp-1">{k.notes}</span>
                          </>
                        )}
                      </div>
                      {k.videoUrl && (
                        <a
                          href={k.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 rounded-sm border border-shiroi-900/40 bg-shiroi-950/30 px-3 py-1.5 text-xs font-medium text-shiroi-400 transition-colors hover:border-shiroi-700 hover:bg-shiroi-900/40 hover:text-shiroi-300"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          <span>Ver en YouTube</span>
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
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
