import type { Metadata } from 'next';
import SectionHeader from '@/components/sections/SectionHeader';

export const metadata: Metadata = {
  title: 'Técnicas — Kihon y Kumite',
  description:
    'Referencia de las técnicas fundamentales del Shotokan: golpes, bloqueos, patadas y posiciones.',
};

const GOLPES = [
  { romaji: 'Choku-zuki', kanji: '直突き', desc: 'Puño recto, técnica más básica.' },
  { romaji: 'Oi-zuki', kanji: '追い突き', desc: 'Puño recto con paso al frente.' },
  { romaji: 'Gyaku-zuki', kanji: '逆突き', desc: 'Puño recto con la mano trasera.' },
  { romaji: 'Kizami-zuki', kanji: '刻み突き', desc: 'Puño recto con la mano delantera (jab).' },
  { romaji: 'Uraken-uchi', kanji: '裏拳打', desc: 'Golpe con el reverso del puño.' },
  { romaji: 'Shuto-uchi', kanji: '手刀打', desc: 'Golpe con el canto de la mano.' },
  { romaji: 'Empi-uchi', kanji: '猿臂打', desc: 'Golpe con el codo.' },
];

const BLOQUEOS = [
  { romaji: 'Age-uke', kanji: '上げ受け', desc: 'Bloqueo ascendente.' },
  { romaji: 'Soto-uke', kanji: '外受け', desc: 'Bloqueo externo (de dentro hacia fuera).' },
  { romaji: 'Uchi-uke', kanji: '内受け', desc: 'Bloqueo interno (de fuera hacia dentro).' },
  { romaji: 'Gedan-barai', kanji: '下段払い', desc: 'Barrido bajo.' },
  { romaji: 'Shuto-uke', kanji: '手刀受け', desc: 'Bloqueo con el canto de la mano.' },
];

const PATADAS = [
  { romaji: 'Mae-geri', kanji: '前蹴り', desc: 'Patada frontal.' },
  { romaji: 'Mawashi-geri', kanji: '回し蹴り', desc: 'Patada circular.' },
  { romaji: 'Yoko-geri keage', kanji: '横蹴り蹴上げ', desc: 'Patada lateral ascendente.' },
  { romaji: 'Yoko-geri kekomi', kanji: '横蹴り蹴込み', desc: 'Patada lateral penetrante.' },
  { romaji: 'Ushiro-geri', kanji: '後ろ蹴り', desc: 'Patada hacia atrás.' },
  { romaji: 'Fumikomi', kanji: '踏み込み', desc: 'Patada aplastante descendente.' },
];

const POSICIONES = [
  { romaji: 'Zenkutsu-dachi', kanji: '前屈立', desc: 'Posición adelantada (frontal).' },
  { romaji: 'Kokutsu-dachi', kanji: '後屈立', desc: 'Posición atrasada.' },
  { romaji: 'Kiba-dachi', kanji: '騎馬立', desc: 'Posición de jinete.' },
  { romaji: 'Fudō-dachi', kanji: '不動立', desc: 'Posición enraizada.' },
];

export default function TecnicasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Referencia técnica"
        title="Técnicas"
        subtitle="Kihon: la gramática del movimiento"
      />

      <section className="section">
        <SectionHeader
          title="Kihon"
          description="Las técnicas básicas se entrenan repetidamente para que el cuerpo las ejecute con naturalidad, sin pensar. Son la base sin la cual ni kata ni kumite pueden existir."
        />

        <TechGroup title="Golpes" subtitle="Uchi / Tsuki" items={GOLPES} />
        <TechGroup title="Bloqueos" subtitle="Uke" items={BLOQUEOS} />
        <TechGroup title="Patadas" subtitle="Geri" items={PATADAS} />
        <TechGroup title="Posiciones" subtitle="Dachi" items={POSICIONES} />
      </section>

      <section className="section border-t border-ink-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <SectionHeader title="Kumite" />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-300">
              <p>
                <strong className="text-ink-100">Kumite</strong> (組手) significa literalmente «mano
                entrelazada»: el combate. Es la aplicación dinámica del kihon y el kata contra un
                oponente real.
              </p>
              <p>
                En el dojo practicamos varias formas: <em>gohon kumite</em>, <em>sanbon kumite</em>,{' '}
                <em>ippon kumite</em> y <em>jiyu ippon kumite</em>, hasta llegar al{' '}
                <em>jyu kumite</em> (combate libre). Cada forma entrena una capacidad distinta:
                distancia, timing, lectura, reacción.
              </p>
            </div>
          </div>
          <aside className="card-minimal p-6">
            <div className="eyebrow mb-3">Principios del kumite</div>
            <ul className="space-y-3 text-sm text-ink-300">
              {[
                'Ma-ai: distancia justa.',
                'Zanshin: atención continua, incluso después del golpe.',
                'Kime: foco y compromiso total.',
                'Respect: el saludo antes y después del combate.',
                'Control: la fuerza se mide, no se descarga.',
              ].map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-shiroi-500" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}

function TechGroup({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Array<{ romaji: string; kanji: string; desc: string }>;
}) {
  return (
    <div className="mt-12">
      <div className="flex items-baseline justify-between border-b border-ink-900 pb-3 mb-6">
        <h3 className="font-display text-xl text-ink-100">{title}</h3>
        <span className="text-xs text-ink-500 uppercase tracking-wider">{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <div key={t.romaji} className="card-minimal p-4">
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-display text-base text-ink-100">{t.romaji}</div>
              <div className="text-xs text-shiroi-600">{t.kanji}</div>
            </div>
            <p className="mt-2 text-sm text-ink-400">{t.desc}</p>
          </div>
        ))}
      </div>
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
