/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import SectionHeader from '@/components/sections/SectionHeader';
import { getContent } from '@/lib/utils';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Historia del Karate y el Shotokan',
  description:
    'De Okinawa al Dojo Shiroi Ryu: la cadena genealógica del karate, el Shotokan, la SKIF de Hirokazu Kanazawa y la línea Coronel-Guerra en Argentina.',
};

export default async function HistoriaPage() {
  const [dojoHistory, customText] = await Promise.all([
    getContent('dojo.history'),
    getContent('historia.custom'),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Nuestra tradición"
        title="Historia del Karate"
        subtitle="De Okinawa al Dojo Shiroi Ryu, un linaje de siglos"
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose-custom">
        <Section sectionTitle="1. Orígenes en Okinawa">
          <p>
            El karate no es un arte marcial japonés en su origen, sino <em>okinawense</em>. Las
            islas que hoy forman la prefectura de Okinawa constituyeron, entre 1429 y 1879, un
            reino independiente — el <strong>Reino de Ryukyu</strong> — que funcionó como bisagra
            comercial entre Japón, China y el sudeste asiático. Esa ubicación geográfica expuso al
            archipiélago, durante siglos, a una doble influencia cultural: las tradiciones
            marciales chinas llegadas principalmente desde la provincia de Fujian, y las prácticas
            de combate nativas de la corte y los pueblos ryukyuenses.
          </p>
          <p>
            Lo que se practicaba en Okinawa antes del siglo XX no era una sola escuela, sino una
            constelación de métodos locales llamados colectivamente <em>te</em> ("mano" en lengua
            okinawana). Hacia el siglo XVIII ese <em>te</em> empezó a absorber técnicas chinas y
            pasó a llamarse <em>Tōde</em> (唐手, "mano china"), un nombre que subrayaba su vínculo
            con el kenpo de Fujian. Con el tiempo, esta práctica se diferenció en tres tradiciones
            regionales: <strong>Shuri-te</strong> (la tradición de la capital real, rápida y
            lineal), <strong>Naha-te</strong> (la del puerto, más circular y con trabajo de
            respiración <em>ibuki</em>) y <strong>Tomari-te</strong> (de carácter mixto, en el
            pueblo pesquero del mismo nombre). Las tres ciudades están a pocos kilómetros entre sí
            y, según el propio Funakoshi, "las diferencias entre sus artes eran esencialmente de
            énfasis, no de tipo".
          </p>
          <p>
            El personaje bisagra fue <strong>Ankō Itosu</strong> (1831-1915), discípulo de Sokon
            Matsumura. Preocupado por la violencia callejera entre jóvenes okinawenses, redactó en
            1908 los "Diez Preceptos del Karate" e introdujo la enseñanza sistemática en las
            escuelas de Okinawa a partir de 1901. Es a partir de su iniciativa que el karate dejó
            de ser un saber clandestino para transformarse en disciplina educativa pública, primer
            paso de su viaje hacia el mundo.
          </p>
        </Section>

        <Section sectionTitle="2. Gichin Funakoshi (1868-1957)">
          <p>
            El nombre que cambia la historia del karate es el de <strong>Gichin Funakoshi</strong>,
            nacido el 10 de noviembre de 1868 en Yamakawa, Shuri, Okinawa. Descendiente de una
            familia de samuráis al servicio de la nobleza del Reino de Ryukyu, comenzó su
            formación a los 11 años bajo los maestros <strong>Ankō Azato</strong> y{' '}
            <strong>Ankō Itosu</strong>, los dos grandes referentes del karate okinawense de su
            tiempo.
          </p>
          <p>
            En 1922, invitado a la <strong>Primera Exhibición Atlética Nacional</strong>{' '}
            organizada por el <em>Dai Nihon Butokukai</em> en Kioto, Funakoshi realizó la primera
            demostración pública de karate en Japón continental. El éxito fue inmediato. A
            invitación de Jigorō Kanō (fundador del judo), ofreció una segunda demostración en el
            <em> Kōdōkan</em> de Tokio — el momento que se considera el verdadero despegue del
            karate moderno. En lugar de regresar a Okinawa como pensaba, se quedó en Tokio.
          </p>
          <p>
            En 1929, Funakoshi reemplazó la grafía 唐手 (<em>Tōde</em>, "mano china") por 空手 (
            <em>karate</em>, "mano vacía"), aprovechando un homófono: 空 también se pronuncia{' '}
            <em>kara</em>, pero significa "vacío", dándole al arte una identidad japonesa propia y
            una resonancia zen que él mismo cultivaba. Simultáneamente definió los Veinte Preceptos
            del Karate (<em>Nijū Kun</em>), publicó en 1935 su obra magna <em>Karate-dō Kyōhan</em>{' '}
            y en 1939 construyó, con sus propios recursos, el primer dojo <strong>Shōtōkan</strong>
            en el barrio de Zoshigaya, Tokio. <strong>Shōtō</strong> era su seudónimo poético
            ("pino susurrante"); <strong>kan</strong>, "casa" o "sala". Así, <em>Shōtōkan</em>{' '}
            significa literalmente "la casa de Shōtō".
          </p>
        </Section>

        <Section sectionTitle="3. El Shotokan y la JKA">
          <p>
            El dojo original de Zoshigaya fue destruido por los bombardeos aliados sobre Tokio en
            1945. Al terminar la guerra, varios alumnos senior de Funakoshi — entre ellos{' '}
            <strong>Masatoshi Nakayama</strong> (1913-1987) e Hidetaka Nishiyama — formalizaron la
            estructura institucional del estilo fundando la <strong>Japan Karate Association</strong>
            (日本空手協会, <em>Nihon Karate Kyōkai</em>), establecida a finales de 1948 (o en
            1949, según la fuente) y reconocida legalmente por el Ministerio de Educación japonés
            el 10 de abril de 1957.
          </p>
          <p>
            Funakoshi, ya anciano, fue nombrado <em>Saikō Shihan</em> (Director Supremo Honorario);
            el mando operativo recayó en Nakayama como <em>chief instructor</em>, cargo que ejerció
            desde 1958 hasta su muerte. Funakoshi falleció el 26 de abril de 1957, a los 89 años,
            días después del reconocimiento legal de la JKA. Una pieza importante de este proceso
            fue su hijo <strong>Yoshitaka "Gigo" Funakoshi</strong> (1906-1945), quien introdujo
            los cambios técnicos profundos — patadas más altas, ataques largos y los formatos
            modernos de kumite — que definen al Shotokan actual.
          </p>
          <p>
            Durante las décadas de 1960 y 1970, la JKA se expandió a nivel mundial a través de una
            generación de instructores que viajaron por Europa, Asia y América: Nishiyama,
            Okazaki, Asai, Kase, Kanazawa, Enoeda, Kawasoe, entre otros. Nakayama fue el gran
            sistematizador técnico: publicó los manuales que siguen siendo referencia y consolidó
            la trinidad <em>kihon</em> / <em>kata</em> / <em>kumite</em> como columna vertebral
            del entrenamiento.
          </p>
        </Section>

        <Section sectionTitle="4. Hirokazu Kanazawa y la SKIF">
          <p>
            <strong>Hirokazu Kanazawa</strong> (1931-2019) es una de las figuras bisagra del
            Shotokan del siglo XX. Alumno directo tanto de Nakayama como del propio Funakoshi en
            la Universidad de Takushoku, Kanazawa fue campeón nacional de kumite en 1957 y doble
            campeón de kumite y kata en 1958. Incorporado a la JKA como instructor profesional,
            entre 1960 y mediados de los 70 fue enviado por la federación a Hawái, Reino Unido,
            Alemania y otros países como instructor jefe de la División Internacional.
          </p>
          <p>
            En diciembre de 1977, Kanazawa renunció a la JKA. Las razones no son del todo
            transparentes — diferencias filosóficas con el rumbo competitivo de la institución,
            deseo de mayor autonomía para su proyección internacional y la salida simultánea de su
            compañero Shiro Asano, que lo invitó a construir juntos una nueva organización.
            Apenas un año después, en octubre de 1978, Kanazawa fundó en Tokio la{' '}
            <strong>Shotokan Karate-dō International Federation</strong> (SKIF), con un modelo
            nítido: una sola federación internacional dirigida por un solo instructor jefe (
            <em>soke</em>), dedicada a preservar el Shotokan tradicional y difundirlo globalmente
            bajo un sistema uniforme.
          </p>
          <p>
            La filosofía técnica de la SKIF, tal como Kanazawa la formuló, gira sobre tres ejes.
            Primero, el <em>kihon</em> ejecutado con la misma precisión y profundidad que el{' '}
            <em>kata</em>, desde el <em>hara</em> (centro del abdomen) con respiración controlada.
            Segundo, un sistema de kumite numerado (1, 2, 3…) que identifica las defensas y
            contraataques de cada tipo de kumite preestablecido (<em>yakusoku kumite</em>), lo que
            garantiza la uniformidad global sin que maestro y alumno estén físicamente juntos.
            Tercero, la defensa en ocho ángulos (<em>tenshin</em>) — ocho direcciones, ocho
            defensas en los niveles avanzados — que permite a una persona más pequeña defenderse
            de una más grande usando el giro, el desplazamiento y el ángulo correcto. En palabras
            del propio Kanazawa, el objetivo es un karate practicables a lo largo de toda la vida,
            en coherencia con el precepto 14 de Funakoshi.
          </p>
          <p>
            En 2014, Kanazawa formalizó el traspaso: su hijo mayor <strong>Nobuaki Kanazawa</strong>
            (n. 1972, campeón mundial SKIF de kumite en 2000) asumió como <em>Kancho</em> (director
            máximo), y <strong>Manabu Murakami</strong> se convirtió en <em>Shuseki Shihan</em>{' '}
            (instructor jefe). Kanazawa falleció en Tokio el 8 de diciembre de 2019 a los 88 años,
            y la SKIF GHQ emitió un comunicado oficial ratificando la continuidad institucional.
          </p>
        </Section>

        <Section sectionTitle="5. SKIF Argentina: la línea Coronel-Guerra">
          <p>
            El puente entre Tokio y la Argentina fue <strong>Hiroshi Ishikawa</strong>, conocido
            en el mundo del karate como "El Tigre de América". Nacido en Japón, Ishikawa emigró
            a México en 1976 a los 28 años, fue alumno directo de Kanazawa y Nakayama, y desde
            1980 fue director técnico de la Subsecretaría del Deporte y de la Asociación Mexicana
            de Karate-Do. Paralelamente se convirtió en el principal referente de la SKIF para
            toda América Latina y el Caribe. Como entrenador, llevó a Venezuela al título mundial
            SKIF de kumite por equipos masculinos en el Campeonato Mundial de Milán de 1997.
            Ishikawa viviendo en México desde 1976, ocho años antes de que la SKIF llegara a
            Buenos Aires, fue literalmente el puente humano que hizo posible que la cadena
            Kanazawa → América Latina → Argentina se cerrara.
          </p>
          <p>
            En Buenos Aires, los introductores de la línea fueron <strong>Mario Coronel</strong> y
            el <em>sensei</em> <strong>Barilari</strong>, quienes hacia 1986-1987 invitaron a
            Ishikawa a dar seminarios y organizaron el primer reconocimiento formal: en noviembre
            de 1987 la SKIF de Japón reconoció a la <strong>Asociación Argentina Shotokan Karate
            Do Internacional</strong> como entidad afiliada y representante del Shotokan SKIF en
            el país. Coronel, nacido circa 1951, había iniciado judo a los 13 años (1964) y karate
            en 1965, y se mantuvo al frente de la jefatura nacional al menos durante quince
            años; su referente técnico directo era Manabu Murakami, a quien identificaba como el
            principal instructor internacional enviado por la SKIF GHQ.
          </p>
          <p>
            Junto a Coronel, el nombre asociado de manera estable a la dirección operativa de la
            escuela fue el de <strong>Miguel Ángel Guerra</strong>, con quien Coronel condujo la
            unidad funcional conocida como "la escuela de Mario Coronel y Miguel Guerra".
            Coronel llegó a 6° <em>dan</em> SKIF (al menos desde 2008), y los seminarios
            internacionales — incluida la presencia de Sōke Hirokazu Kanazawa en Mar del Plata en
            2007 y la visita de Nobuaki Kanazawa en 2023 — fueron organizados por esa dupla
            durante casi dos décadas.
          </p>
          <p>
            El eslabón operativo vivo de la cadena es hoy Miguel Ángel Guerra,{' '}
            <strong>6° <em>dan</em> SKIF y Jefe Instructor de la AASKI Argentina</strong>. Su
            única aparición competitiva documentada en instancias internacionales es la medalla de
            bronce en Kata Men Masters U55 del Campeonato Mundial SKIF de Tokio 2006, detrás de
            Tetsunori Yoshioka (oro, SKIF Japón) y Hernán Beltrán (plata, SKIF Chile). A partir de
            esa fecha prioriza el rol técnico de Jefe Instructor — práctica diaria, exámenes,
            seminarios, continuidad doctrinal — sobre el competitivo. Su nombre legal completo es{' '}
            <em>Ángel Miguel Guerra</em> (no debe confundirse con el piloto de Fórmula 1 del
            mismo nombre, nacido en 1953).
          </p>
          <p>
            Una distinción institucional que conviene no perder: SKIF Argentina tiene dos
            caras que coexisten sin confundirse. La faz pública e institucional — relaciones con
            la GHQ, certámenes continentales, acreditaciones, prensa — está delegada por el
            modelo SKIF a un Director local de la rama Hoitsukai. La faz operativa, técnica,
            está en cabeza de <strong>Miguel Ángel Guerra</strong> como Jefe Instructor AASKI.
            Quien practique bajo esta tradición hereda, técnicamente, lo que Guerra transmite
            día a día en los dojos de la red. Por eso, cuando alguien pregunta quién es "el{' '}
            <em>sensei</em>" de un alumno de AASKI, la respuesta razonable es{' '}
            <strong>Miguel Guerra</strong>.
          </p>
          <p>
            La cadena completa, leída de arriba abajo, puede trazarse así: <em>te</em> y{' '}
            <em>tōde</em> en Okinawa (siglos XV-XIX) → Sakugawa → Matsumura → Itosu → Funakoshi →
            Nakayama → Kanazawa → Ishikawa → Coronel y Barilari → Miguel Guerra. Cada eslabón es
            un eslabón humano, no geográfico; lo que se transmite no es solo técnica, sino una
            doctrina: <em>kihon</em> desde el <em>hara</em>, kumite numerado, ocho ángulos de
            defensa, armonía por encima de la competencia, karate practicables a lo largo de toda
            la vida. Quien se calza el <em>gi</em> en un dojo de AASKI hereda — sin saberlo — esa
            cadena viva de casi doscientos años.
          </p>
        </Section>

        {customText && (
          <Section sectionTitle="6. La historia de nuestro dojo">
            <p className="whitespace-pre-wrap">{customText}</p>
          </Section>
        )}

        {dojoHistory && (
          <aside className="mt-12 rounded-md border border-shiroi-900/40 bg-shiroi-950/20 p-6">
            <div className="eyebrow mb-3">Información local</div>
            <h3 className="font-display text-xl text-ink-100 mb-3">Nuestra historia</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-300">{dojoHistory}</p>
          </aside>
        )}

        <div className="mt-12 rounded-md border border-ink-800 bg-ink-900/40 p-5 text-xs text-ink-500">
          <strong className="text-ink-300">Investigación genealógica completa:</strong>{' '}
          <a href="https://github.com" className="underline hover:text-shiroi-400">
            docs/research/shotokan-history.md
          </a>{' '}
          (50+ referencias sobre orígenes del karate en Okinawa, fundación de la SKIF por
          Hirokazu Kanazawa en 1978 y la línea Coronel-Guerra en Argentina). Fuentes principales:
          Wikipedia, Japan Karate Association (JKA), SKIF World, SKIF Argentina, KarateRec,
          Honorable Concejo Deliberante de General Pueyrredón.
        </div>
      </article>
    </>
  );
}

function Section({ sectionTitle, children }: { sectionTitle: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="font-display text-2xl text-ink-100 mb-4 flex items-center gap-3">
        <span className="h-px w-6 bg-shiroi-600" aria-hidden />
        {sectionTitle}
      </h2>
      <div className="space-y-4 text-base leading-relaxed text-ink-300 [&_strong]:text-ink-100 [&_em]:text-ink-200">
        {children}
      </div>
    </section>
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
