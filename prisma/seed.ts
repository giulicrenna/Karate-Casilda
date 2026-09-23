// prisma/seed.ts
// Ejecutar con: npm run db:seed
// Crea el usuario administrador inicial y contenido demo.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@karatecasilda.local';
  const adminName = process.env.ADMIN_NAME || 'Administrador';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('❌ ADMIN_PASSWORD no está definida en .env.local');
    process.exit(1);
  }

  if (adminPassword.includes('REEMPLAZAR') || adminPassword.length < 8) {
    console.error('❌ ADMIN_PASSWORD debe ser una contraseña real de al menos 8 caracteres.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: 'admin',
    },
  });

  console.log(`✅ Admin inicial creado/actualizado: ${admin.email}`);

  // Contenido institucional por defecto (editables desde el panel)
  const defaults: Array<{ key: string; value: string }> = [
    { key: 'home.hero.title', value: 'Karate Casilda' },
    { key: 'home.hero.subtitle', value: 'Dojo Shiroi Ryu — Shotokan SKIF' },
    { key: 'home.hero.tagline', value: 'Tradición, disciplina y respeto.' },
    { key: 'home.hero.description', value: 'Un dojo de karate tradicional Shotokan bajo la línea de SKIF, en Casilda, Santa Fe.' },
    { key: 'home.values.title', value: 'Nuestros valores' },
    { key: 'dojo.name', value: 'Karate Casilda — Dojo Shiroi Ryu' },
    { key: 'dojo.shortName', value: 'Dojo Shiroi Ryu' },
    { key: 'dojo.style', value: 'Shotokan — SKIF' },
    { key: 'dojo.history', value: '' }, // pendiente de validación por el dojo
    { key: 'dojo.instructors', value: '' }, // pendiente de validación
    { key: 'dojo.location', value: 'Casilda, Santa Fe, Argentina' },
    { key: 'dojo.schedule', value: '' }, // pendiente de validación
    { key: 'contact.address', value: '' }, // pendiente de validación
    { key: 'contact.phone', value: '' },
    { key: 'contact.email', value: '' },
    { key: 'contact.instagram', value: '' },
    { key: 'contact.facebook', value: '' },
    { key: 'contact.whatsapp', value: '' },
    { key: 'contact.hours', value: '' },
    { key: 'contact.mapsUrl', value: '' },
    {
      key: 'dokun.original',
      value: '一、人格を練る事\n一、誠の道を守ること\n一、努力の精神を養う事\n一、礼儀を重んずること\n一、血気の勇を戒むること',
    },
    {
      key: 'dokun.romaji',
      value: 'Hitotsu, jinkaku wo tanjuru koto\nHitotsu, makoto no michi wo mamoru koto\nHitotsu, doryoku no seishin wo yashinau koto\nHitotsu, reigi wo omonzuru koto\nHitotsu, kekki no yū wo imashimuru koto',
    },
    {
      key: 'dokun.spanish',
      value: '1. Buscarán la perfección del carácter.\n2. Serán guardianes del camino verdadero.\n3. Cultivarán el espíritu de esfuerzo.\n4. Honrarán la cortesía y el respeto.\n5. Se abstendrán de toda conducta impulsiva.',
    },
    {
      key: 'dokun.principles',
      value: JSON.stringify([
        {
          number: 1,
          original: '一、人格を練る事',
          romaji: 'Jinkaku wo tanjuru koto',
          translation: 'Buscar la perfección del carácter',
          explanation: 'El karate comienza y termina con el respeto. Antes de cualquier técnica, el estudiante debe cultivar su carácter y comportarse con integridad en el dojo y fuera de él.',
        },
        {
          number: 2,
          original: '一、誠の道を守ること',
          romaji: 'Makoto no michi wo mamoru koto',
          translation: 'Ser guardián del camino verdadero',
          explanation: 'Makoto (sinceridad) es la base del camino marcial. Implica honestidad en la práctica, lealtad al dojo y compromiso con el estudio serio del karate-do.',
        },
        {
          number: 3,
          original: '一、努力の精神を養う事',
          romaji: 'Doryoku no seishin wo yashinau koto',
          translation: 'Cultivar el espíritu de esfuerzo',
          explanation: 'No existe el progreso sin esfuerzo constante. El karate-do exige entrenamiento diario, paciencia y la voluntad de superarse en cada sesión.',
        },
        {
          number: 4,
          original: '一、礼儀を重んずること',
          romaji: 'Reigi wo omonzuru koto',
          translation: 'Honrar la cortesía y el respeto',
          explanation: 'La etiqueta (rei) no es formalidad vacía: es la expresión externa del respeto interior. Saludar es reconocer al otro y al camino que ambos transitan.',
        },
        {
          number: 5,
          original: '一、血気の勇を戒むること',
          romaji: 'Kekki no yū wo imashimuru koto',
          translation: 'Abstenerse de la conducta impulsiva',
          explanation: 'La fuerza sin control es peligrosa. El karateka debe dominar el ego, la ira impulsiva y la violencia gratuita. La verdadera fortaleza es la serenidad bajo presión.',
        },
      ]),
    },
    { key: 'shotokan.history', value: '' }, // se inyecta desde research
    { key: 'shotokan.philosophy', value: '' },
    { key: 'skif.history', value: '' },
    { key: 'kata.intro', value: '' },
    { key: 'kihon.intro', value: '' },
    { key: 'kumite.intro', value: '' },
  ];

  for (const { key, value } of defaults) {
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // Datos DEMO claramente identificados
  const demoEvent = await prisma.event.upsert({
    where: { slug: 'demo-torneo-casilda-2026' },
    update: {},
    create: {
      slug: 'demo-torneo-casilda-2026',
      title: '[DEMO] Torneo Casilda 2026',
      date: new Date('2026-08-15T09:00:00'),
      location: 'Casilda, Santa Fe',
      description: '**EVENTO DE DEMOSTRACIÓN.** Este evento es un placeholder para que veas cómo se muestran los eventos reales. Reemplazá este contenido desde el panel de administración.',
      category: 'torneo',
      status: 'upcoming',
      featured: true,
    },
  });

  const demoAlbum = await prisma.album.upsert({
    where: { slug: 'demo-torneo-casilda-2026' },
    update: {},
    create: {
      slug: 'demo-torneo-casilda-2026',
      title: '[DEMO] Torneo Casilda 2026',
      description: 'Álbum de demostración. Para usar fotografías reales, creá un álbum nuevo desde el panel admin y asociá una carpeta real de Google Drive.',
      date: new Date('2026-08-15T09:00:00'),
      driveFolderId: 'DEMO_FOLDER_ID_REEMPLAZAR',
      driveFolderPath: 'Karate Casilda/2026/Torneo Casilda 2026',
      photoCount: 0,
      featured: true,
    },
  });

  await prisma.event.update({
    where: { id: demoEvent.id },
    data: { albumId: demoAlbum.id },
  });

  // Autores demo
  const demoAuthor = await prisma.author.upsert({
    where: { slug: 'sensei-demo' },
    update: {},
    create: {
      slug: 'sensei-demo',
      name: 'Sensei [DEMO]',
      photoDriveFileId: null,
      active: true,
    },
  });

  // Artículo demo
  await prisma.article.upsert({
    where: { slug: 'demo-bienvenida-al-dojo' },
    update: {},
    create: {
      slug: 'demo-bienvenida-al-dojo',
      title: '[DEMO] Bienvenida al cuaderno del dojo',
      excerpt: 'Artículo de demostración para mostrar cómo se ve un artículo publicado en el sitio.',
      body: `## Subtítulo de ejemplo

Este es un artículo **DEMO** que muestra cómo se renderiza el contenido en markdown.

- Negrita con **asteriscos dobles**
- Itálica con *asterisco simple*
- Links como [este](https://karatecasilda.local)
- Listas ordenadas:

1. Primer punto
2. Segundo punto
3. Tercer punto

> Citas en blockquote se ven así. Sirven para destacar reflexiones o frases del sensei.

### Tercer nivel de título

Reemplazá este contenido desde el panel admin con tus artículos reales.`,
      category: 'general',
      coverDriveFileId: null,
      published: true,
      authorId: demoAuthor.id,
    },
  });

  console.log('✅ Contenido institucional inicializado.');
  console.log('✅ Evento DEMO creado.');
  console.log('✅ Álbum DEMO creado (driveFolderId=DEMO_FOLDER_ID_REEMPLAZAR).');
  console.log('✅ Autor DEMO creado.');
  console.log('✅ Artículo DEMO creado.');
  console.log('\n📌 Próximos pasos:');
  console.log('   1. Iniciá sesión en /admin con las credenciales de tu .env.local');
  console.log('   2. Reemplazá el evento/álbum/autor/artículo DEMO con contenido real');
  console.log('   3. Configurá Google Drive siguiendo docs/GOOGLE_DRIVE_SETUP.md');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
