import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/site';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_CONFIG.url.replace(/\/$/, '');
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/historia`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/shotokan`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/skif`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/dojo-kun`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/kata`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/tecnicas`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/eventos`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/galeria`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/articulos`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const events = await prisma.event.findMany({
    select: { slug: true, updatedAt: true },
  });
  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${base}/eventos/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const albums = await prisma.album.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
  const albumRoutes: MetadataRoute.Sitemap = albums.map((a) => ({
    url: `${base}/galeria/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/articulos/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...eventRoutes, ...albumRoutes, ...articleRoutes];
}
