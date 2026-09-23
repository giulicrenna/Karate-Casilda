// Constantes de contenido del Shotokan — datos curados a partir de la investigación
// Estos datos NO son editables desde el admin porque representan el patrimonio
// general del estilo. La información local del dojo (en SiteContent) sí es editable.

import type { KataDTO, DojoKunPrinciple } from '@/types';

export const SHOTOKAN_KATA: KataDTO[] = [
  { number: 1, name: 'Taikyoku Shodan', romaji: 'Taikyoku Shodan', kanji: '太極初段', meaning: 'Causa primera, nivel 1', movements: 20, level: 'introductorio', notes: 'Creado por Gichin Funakoshi como kata introductorio.', videoUrl: 'https://www.youtube.com/watch?v=HIZk8659ppg' },
  { number: 2, name: 'Heian Shodan', romaji: 'Heian Shodan', kanji: '平安初段', meaning: 'Mente apacible, nivel 1', movements: 21, level: 'básico', videoUrl: 'https://www.youtube.com/watch?v=lZyI9mtk924' },
  { number: 3, name: 'Heian Nidan', romaji: 'Heian Nidan', kanji: '平安二段', meaning: 'Mente apacible, nivel 2', movements: 26, level: 'básico', videoUrl: 'https://www.youtube.com/watch?v=_ZPODff5Vew' },
  { number: 4, name: 'Heian Sandan', romaji: 'Heian Sandan', kanji: '平安三段', meaning: 'Mente apacible, nivel 3', movements: 20, level: 'básico', videoUrl: 'https://www.youtube.com/watch?v=28T1JbwbjuE' },
  { number: 5, name: 'Heian Yondan', romaji: 'Heian Yondan', kanji: '平安四段', meaning: 'Mente apacible, nivel 4', movements: 27, level: 'básico', videoUrl: 'https://www.youtube.com/watch?v=qxw4Guoogu0' },
  { number: 6, name: 'Heian Godan', romaji: 'Heian Godan', kanji: '平安五段', meaning: 'Mente apacible, nivel 5', movements: 23, level: 'básico', videoUrl: 'https://www.youtube.com/watch?v=dkCHEv5y51A' },
  { number: 7, name: 'Tekki Shodan', romaji: 'Tekki Shodan', kanji: '鉄騎初段', meaning: 'Jinete de hierro, nivel 1', movements: 29, level: 'básico', notes: 'Se ejecuta íntegramente en kiba-dachi (posición de jinete).', videoUrl: 'https://www.youtube.com/watch?v=Cx0Qwnxq0q4' },
  { number: 8, name: 'Bassai Dai', romaji: 'Bassai Dai', kanji: '抜塞大', meaning: 'Penetrar la fortaleza, grande', movements: 42, level: 'intermedio', videoUrl: 'https://www.youtube.com/watch?v=EryYYUXvojw' },
  { number: 9, name: 'Kanku Dai', romaji: 'Kanku Dai', kanji: '観空大', meaning: 'Mirar al cielo, grande', movements: 65, level: 'intermedio', videoUrl: 'https://www.youtube.com/watch?v=Jkv8Ks_fEqk' },
  { number: 10, name: 'Empi', romaji: 'Empi', kanji: '燕飛', meaning: 'Golondrina en vuelo', movements: 37, level: 'intermedio', videoUrl: 'https://www.youtube.com/watch?v=SW5907Eeo7c' },
  { number: 11, name: 'Jion', romaji: 'Jion', kanji: '慈恩', meaning: 'Amor y bondad', movements: 47, level: 'intermedio', videoUrl: 'https://www.youtube.com/watch?v=cQdAZ94OkNA' },
  { number: 12, name: 'Hangetsu', romaji: 'Hangetsu', kanji: '半月', meaning: 'Media luna', movements: 41, level: 'intermedio', videoUrl: 'https://www.youtube.com/watch?v=G6bR1KpZS4w' },
  { number: 13, name: 'Tekki Nidan', romaji: 'Tekki Nidan', kanji: '鉄騎二段', meaning: 'Jinete de hierro, nivel 2', movements: 24, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=4UgFiXQH9GA' },
  { number: 14, name: 'Tekki Sandan', romaji: 'Tekki Sandan', kanji: '鉄騎三段', meaning: 'Jinete de hierro, nivel 3', movements: 36, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=A6F4YIaiJck' },
  { number: 15, name: 'Gankaku', romaji: 'Gankaku', kanji: '岩鶴', meaning: 'Grulla sobre la roca', movements: 42, level: 'avanzado' },
  { number: 16, name: 'Jitte', romaji: 'Jitte', kanji: '十手', meaning: 'Diez manos', movements: 24, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=u4Hw9nipExg' },
  { number: 17, name: 'Bassai Sho', romaji: 'Bassai Sho', kanji: '抜塞小', meaning: 'Penetrar la fortaleza, pequeño', movements: 27, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=ki17srZIQHI' },
  { number: 18, name: 'Kanku Sho', romaji: 'Kanku Sho', kanji: '観空小', meaning: 'Mirar al cielo, pequeño', movements: 48, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=R1KqSlnu4JE' },
  { number: 19, name: 'Sochin', romaji: 'Sochin', kanji: '壮鎭', meaning: 'Fuerza y calma', movements: 41, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=ksZ3TGAGdIc' },
  { number: 20, name: 'Nijushiho', romaji: 'Nijushiho', kanji: '二十四歩', meaning: 'Veinticuatro pasos', movements: 34, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=1Y4WNuaojD4' },
  { number: 21, name: 'Chinte', romaji: 'Chinte', kanji: '珍手', meaning: 'Manos extraordinarias', movements: 32, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=ou14EWbogB0' },
  { number: 22, name: 'Unsu', romaji: 'Unsu', kanji: '雲手', meaning: 'Manos de nube', movements: 48, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=NK7VwQrLNu0' },
  { number: 23, name: 'Gojushiho Sho', romaji: 'Gojushiho Sho', kanji: '五十四歩小', meaning: '54 pasos, pequeño', movements: 65, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=sFAzqnAW9NM' },
  { number: 24, name: 'Gojushiho Dai', romaji: 'Gojushiho Dai', kanji: '五十四歩大', meaning: '54 pasos, grande', movements: 67, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=r-77w9I5kO8' },
  { number: 25, name: 'Meikyo', romaji: 'Meikyo', kanji: '明鏡', meaning: 'Espejo brillante', movements: 33, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=W8vSLsnZJFA' },
  { number: 26, name: 'Jiin', romaji: 'Jiin', kanji: '慈蔭', meaning: 'Templo de amor y sombra', movements: 35, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=RiG93fNAmz0' },
  { number: 27, name: 'Wankan', romaji: 'Wankan', kanji: '王冠', meaning: 'Corona del rey', movements: 24, level: 'avanzado', videoUrl: 'https://www.youtube.com/watch?v=py_aMWc4HDo' },
];

export const DEFAULT_DOJO_KUN: DojoKunPrinciple[] = [
  {
    number: 1,
    original: '一、人格完成に努めること',
    romaji: 'Hitotsu, jinkaku kansei ni tsutomeru koto',
    translation: 'Buscar la perfección del carácter',
    explanation: 'El karate comienza y termina con el respeto. Antes de cualquier técnica, el estudiante debe cultivar su carácter y aplicar el entrenamiento a su vida cotidiana, dentro y fuera del dojo.',
  },
  {
    number: 2,
    original: '一、誠の道を守ること',
    romaji: 'Hitotsu, makoto no michi o mamoru koto',
    translation: 'Ser guardián del camino verdadero',
    explanation: 'Makoto — sinceridad — es la base del camino marcial. Implica honestidad en la práctica, lealtad al dojo y compromiso con el estudio serio del karate-dō.',
  },
  {
    number: 3,
    original: '一、努力の精神を養うこと',
    romaji: 'Hitotsu, doryoku no seishin o yashinau koto',
    translation: 'Cultivar el espíritu de esfuerzo',
    explanation: 'No existe progreso sin esfuerzo constante. El karate-dō exige entrenamiento diario, paciencia y la voluntad de superarse en cada sesión.',
  },
  {
    number: 4,
    original: '一、礼儀を重んずること',
    romaji: 'Hitotsu, reigi o omonzuru koto',
    translation: 'Honrar la cortesía y el respeto',
    explanation: 'La etiqueta (rei) no es formalismo vacío: es la expresión externa del respeto interior. Funakoshi escribió que sin cortesía no hay dojo.',
  },
  {
    number: 5,
    original: '一、血気の勇を戒むること',
    romaji: 'Hitotsu, kekki no yū o imashimuru koto',
    translation: 'Abstenerse de la conducta impulsiva',
    explanation: 'La fuerza sin control es peligrosa. El karateka debe dominar el ego, la ira y la violencia gratuita. La verdadera fortaleza es la serenidad bajo presión.',
  },
];

export const DOJO_KUN_HITOTSU_TEXT = '一';

// =====================================================
// ARTÍCULOS DEL DOJO — categorías y mapa de colores
// =====================================================
export const ARTICLE_CATEGORIES = [
  { id: 'anuncios',  label: 'Anuncios',  color: 'shiroi' },
  { id: 'tecnica',   label: 'Técnica',   color: 'emerald' },
  { id: 'historia',  label: 'Historia',  color: 'amber' },
  { id: 'eventos',   label: 'Eventos',   color: 'sky' },
  { id: 'general',   label: 'General',   color: 'ink' },
] as const;

export type ArticleCategoryId = typeof ARTICLE_CATEGORIES[number]['id'];

export const ARTICLE_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  ARTICLE_CATEGORIES.map((c) => [c.id, c.label])
);

export const ARTICLE_CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  ARTICLE_CATEGORIES.map((c) => [c.id, c.color])
);
