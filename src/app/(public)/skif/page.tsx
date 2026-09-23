import type { Metadata } from 'next';
import SectionHeader from '@/components/sections/SectionHeader';
import { getContent } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'SKIF — Shotokan Karate-do International Federation',
  description:
    'La SKIF: fundada en 1978 por Hirokazu Kanazawa, es una de las mayores organizaciones de Shotokan del mundo.',
};

export default async function SkifPage() {
  const affiliation = await getContent('skif.affiliation', '');

  return (
    <>
      <PageHeader
        eyebrow="Organización"
        title="SKIF"
        subtitle="Shotokan Karate-dō International Federation"
      />

      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeader
          title="¿Qué significa SKIF?"
          description="Shotokan Karate-dō International Federation. Una de las organizaciones de Shotokan más grandes del mundo, presente en más de 130 países."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Stat label="Fundación" value="1978" />
          <Stat label="Países" value="130+" />
          <Stat label="Fundador" value="Kanazawa Sōke" />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl text-ink-100 mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-shiroi-600" aria-hidden />
            Historia
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-ink-300">
            <p>
              La <strong className="text-ink-100">SKIF</strong> fue fundada en octubre de
              <strong className="text-ink-100"> 1978</strong> por
              <strong className="text-ink-100"> Sōke Hirokazu Kanazawa</strong> (1931-2019), nacido
              en Iwate, Japón. Kanazawa Sōke fue uno de los últimos discípulos directos de Gichin
              Funakoshi y ocupó el cargo de Director de la División de Asuntos Exteriores de la
              Japan Karate Association antes de fundar su propia organización.
            </p>
            <p>
              La fundación respondió a discrepancias con la línea competitiva de la JKA: Kanazawa
              buscaba preservar un enfoque técnico tradicional, armónico y universal del Shotokan,
              fiel al espíritu original de Funakoshi.
            </p>
            <p>
              En 2002, Kanazawa Sōke recibió de la International Martial Arts Federation del
              gobierno japonés el título de <strong className="text-ink-100">10° Dan</strong> y el
              rango de <strong className="text-ink-100">Sōke</strong> (Fundador). Su legado
              continúa hoy a través de su hijo <strong className="text-ink-100">Kancho Nobuaki
              Kanazawa</strong> y del <strong className="text-ink-100">Shuseki Shihan Manabu
              Murakami</strong>.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl text-ink-100 mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-shiroi-600" aria-hidden />
            Filosofía
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-ink-300">
            <p>
              SKIF se distingue por una ejecución técnica profunda y armónica, con énfasis en el
              <strong className="text-ink-100"> kime</strong> y la fluidez del movimiento. Su
              filosofía es la búsqueda de la armonía entre cuerpo, mente y espíritu, en línea con
              los preceptos de Funakoshi.
            </p>
            <p>
              La organización mantiene una política de puertas abiertas hacia la comunidad
              internacional, alejada del secretismo o la endogamia. Practica sistemáticamente
              kihon, kata y kumite, y organiza seminarios internacionales frecuentes.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl text-ink-100 mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-shiroi-600" aria-hidden />
            SKIF Argentina
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-ink-300">
            <p>
              La organización nacional es <strong className="text-ink-100">SKIF Argentina</strong>,
              con su Hombu Dojo en el Instituto Sucre (Sucre 2336, Belgrano, Buenos Aires), a
              cargo del Prof. Sergio Pereyra. La red pública de dojos afiliados al momento de
              publicación de este sitio <strong className="text-ink-100">no incluye un dojo
              específicamente identificado en Casilda</strong>.
            </p>
            {affiliation ? (
              <p className="rounded-md border border-shiroi-900/40 bg-shiroi-950/20 p-4 text-sm">
                <strong className="text-shiroi-400">Afiliación local:</strong>{' '}
                <span className="whitespace-pre-wrap">{affiliation}</span>
              </p>
            ) : (
              <p className="rounded-md border border-dashed border-ink-800 bg-ink-900/40 p-4 text-sm text-ink-400 italic">
                La información de afiliación específica del Dojo Shiroi Ryu está pendiente de
                validación por el sensei responsable. Consultá el panel de administración o
                contactanos para confirmar.
              </p>
            )}
          </div>
        </section>

        <div className="mt-12 rounded-md border border-ink-800 bg-ink-900/40 p-5 text-xs text-ink-500">
          <strong className="text-ink-300">Fuentes:</strong> SKIF World (skifworld.com), SKIF
          Argentina (skif.com.ar). Lista de dojos verificada en septiembre 2026.
        </div>
      </article>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-minimal p-5 text-center">
      <div className="font-display text-3xl text-shiroi-500">{value}</div>
      <div className="eyebrow mt-2">{label}</div>
    </div>
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
