import { z } from 'zod';

export const EventCategoryEnum = z.enum([
  'torneo',
  'examen',
  'seminario',
  'exhibicion',
  'entrenamiento',
  'otro',
]);

export const EventStatusEnum = z.enum(['upcoming', 'past', 'cancelled']);

export const EventInputSchema = z.object({
  title: z.string().min(3).max(160),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida'),
  location: z.string().max(200).optional().nullable(),
  description: z.string().min(1).max(20000),
  category: EventCategoryEnum,
  coverImage: z.string().url().optional().nullable(),
  status: EventStatusEnum.default('upcoming'),
  featured: z.boolean().default(false),
  albumId: z.string().optional().nullable(),
});

export const AlbumInputSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(2000).optional().nullable(),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida'),
  driveFolderId: z.string().min(10, 'Drive Folder ID inválido'),
  driveFolderPath: z.string().max(500).optional().nullable(),
  coverImageId: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña requerida'),
});

export const ContentUpdateSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(100000),
});

export const ContactInfoSchema = z.object({
  address: z.string().max(300).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  instagram: z.string().max(200).optional().nullable(),
  facebook: z.string().max(200).optional().nullable(),
  whatsapp: z.string().max(50).optional().nullable(),
  hours: z.string().max(500).optional().nullable(),
  mapsUrl: z.string().url().optional().nullable().or(z.literal('')),
});

export const ArticleCategoryEnum = z.enum([
  'anuncios',
  'tecnica',
  'historia',
  'eventos',
  'general',
]);

export const ArticleInputSchema = z.object({
  title: z.string().min(3).max(160),
  excerpt: z.string().min(10).max(300),
  body: z.string().min(20).max(50000),
  category: ArticleCategoryEnum,
  coverDriveFileId: z.string().min(10).max(200).optional().nullable(),
  published: z.boolean().default(true),
  authorId: z.string().min(1),
});

export const AuthorInputSchema = z.object({
  name: z.string().min(2).max(120),
  photoDriveFileId: z.string().min(10).max(200).optional().nullable(),
  active: z.boolean().default(true),
});

export type EventInput = z.infer<typeof EventInputSchema>;
export type AlbumInput = z.infer<typeof AlbumInputSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ContentUpdate = z.infer<typeof ContentUpdateSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type ArticleInput = z.infer<typeof ArticleInputSchema>;
export type AuthorInput = z.infer<typeof AuthorInputSchema>;
