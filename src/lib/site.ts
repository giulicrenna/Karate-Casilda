// Configuración pública del sitio — se usa tanto en SSR como en componentes cliente.
// Las constantes "NEXT_PUBLIC_*" se inyectan en build-time y son seguras para el cliente.

export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Karate Casilda — Dojo Shiroi Ryu',
  shortName: 'Karate Casilda',
  description:
    'Dojo de karate tradicional Shotokan SKIF en Casilda, Santa Fe. Tradición, disciplina y respeto.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  locale: 'es_AR',
  ogImage: '/og-default.png',
  keywords: [
    'Karate Casilda',
    'Shotokan Casilda',
    'Dojo Shiroi Ryu',
    'Karate Shotokan',
    'SKIF',
    'Karate Santa Fe',
    'Karate tradicional',
    'Dojo Argentina',
  ],
  // Lista plana — usada por Footer y consumidores que esperan un único nivel.
  nav: [
    { href: '/', label: 'Inicio' },
    { href: '/historia', label: 'Historia' },
    { href: '/shotokan', label: 'Shotokan' },
    { href: '/skif', label: 'SKIF' },
    { href: '/dojo-kun', label: 'Dojo Kun' },
    { href: '/kata', label: 'Kata' },
    { href: '/tecnicas', label: 'Técnicas' },
    { href: '/eventos', label: 'Eventos' },
    { href: '/galeria', label: 'Galería' },
    { href: '/articulos', label: 'Artículos' },
    { href: '/contacto', label: 'Contacto' },
  ],
  // Agrupado para el Navbar — cada categoría se muestra como desplegable.
  navGroups: [
    {
      label: 'El Dojo',
      children: [
        { href: '/historia', label: 'Historia' },
        { href: '/shotokan', label: 'Shotokan' },
        { href: '/skif', label: 'SKIF' },
        { href: '/dojo-kun', label: 'Dojo Kun' },
      ],
    },
    {
      label: 'Práctica',
      children: [
        { href: '/kata', label: 'Kata' },
        { href: '/tecnicas', label: 'Técnicas' },
      ],
    },
    {
      label: 'Comunidad',
      children: [
        { href: '/eventos', label: 'Eventos' },
        { href: '/galeria', label: 'Galería' },
        { href: '/articulos', label: 'Artículos' },
      ],
    },
  ],
} as const;

export type SiteConfig = typeof SITE_CONFIG;
export type NavItem = { href: string; label: string };
export type NavGroup = { label: string; children: readonly NavItem[] };
