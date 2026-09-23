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

// =====================================================
// ALUMNOS — schemas para Fase 2+
// =====================================================

export const BeltEnum = z.enum([
  'blanca',
  'amarilla',
  'naranja',
  'verde',
  'azul',
  'marfil',
  'negra',
]);

export const StudentCreateSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  dni: z.string().max(20).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'WhatsApp debe estar en formato E.164 (ej: +5493464520203)')
    .optional()
    .nullable()
    .or(z.literal('')),
  birthDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida')
    .optional()
    .nullable(),
  initialPassword: z
    .string()
    .min(8, 'La contraseña inicial debe tener al menos 8 caracteres')
    .max(72),
  mustChangePwd: z.boolean().default(true),
  active: z.boolean().default(true),
  // Profile (opcional al crear)
  weightKg: z.number().min(0).max(500).optional().nullable(),
  heightCm: z.number().int().min(0).max(300).optional().nullable(),
  emergencyName: z.string().max(120).optional().nullable(),
  emergencyPhone: z.string().max(40).optional().nullable(),
  medicalNotes: z.string().max(2000).optional().nullable(),
  allergies: z.string().max(500).optional().nullable(),
  attendanceDaysPerWeek: z.number().int().min(1).max(7).default(2),
  belt: BeltEnum.optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const StudentUpdateSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  dni: z.string().max(20).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'WhatsApp debe estar en formato E.164')
    .optional()
    .nullable()
    .or(z.literal('')),
  birthDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida')
    .optional()
    .nullable(),
  active: z.boolean().optional(),
  // Profile
  weightKg: z.number().min(0).max(500).optional().nullable(),
  heightCm: z.number().int().min(0).max(300).optional().nullable(),
  emergencyName: z.string().max(120).optional().nullable(),
  emergencyPhone: z.string().max(40).optional().nullable(),
  medicalNotes: z.string().max(2000).optional().nullable(),
  allergies: z.string().max(500).optional().nullable(),
  attendanceDaysPerWeek: z.number().int().min(1).max(7).optional(),
  belt: BeltEnum.optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  photoDriveFileId: z.string().min(10).max(200).optional().nullable(),
});

export const StudentPasswordSchema = z
  .string()
  .min(10, 'La contraseña debe tener al menos 10 caracteres')
  .max(72)
  .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
  .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
  .regex(/[0-9]/, 'Debe incluir al menos un dígito');

export const StudentChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: StudentPasswordSchema,
});

export const StudentLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña requerida'),
});

export const StudentRecoverRequestSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const StudentResetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: StudentPasswordSchema,
});

// =====================================================
// CUOTAS Y RECARGOS — schemas para Fase 3
// =====================================================

export const FeeRuleSchema = z.object({
  name: z.string().min(2).max(120),
  daysPerWeek: z.number().int().min(1).max(7),
  monthlyAmount: z.number().min(0).max(10000000),
  effectiveFrom: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida')
    .optional(),
  effectiveUntil: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida')
    .optional()
    .nullable(),
  active: z.boolean().default(true),
});

export const LateSurchargeRuleSchema = z.object({
  name: z.string().min(2).max(120),
  graceDays: z.number().int().min(1).max(28),
  surchargePct: z.number().min(0).max(100),
  active: z.boolean().default(true),
  effectiveFrom: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida')
    .optional(),
  effectiveUntil: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida')
    .optional()
    .nullable(),
});

// =====================================================
// GASTOS DEL DOJO — schemas para Fase 3
// =====================================================

export const ExpenseCategoryEnum = z.enum([
  'alquiler',
  'sueldos',
  'servicios',
  'insumos',
  'mantenimiento',
  'impuestos',
  'otro',
]);

export const ExpenseSchema = z.object({
  category: ExpenseCategoryEnum,
  description: z.string().min(2).max(300),
  amount: z.number().min(0).max(10000000),
  occurredAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida'),
  vendor: z.string().max(160).optional().nullable(),
  receiptDriveFileId: z.string().min(10).max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// =====================================================
// PAGOS / DEUDAS — schemas para Fase 3+
// =====================================================

export const DebtAdjustmentSchema = z.object({
  manualAdjustment: z.number().min(-1000000).max(1000000),
  manualNote: z.string().max(500).optional().nullable(),
});

export const ManualPaymentSchema = z.object({
  debtId: z.string().min(1),
  amount: z.number().min(0.01).max(10000000),
  method: z.enum(['cash', 'transfer', 'manual']),
  paidAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida').optional(),
  notes: z.string().max(500).optional().nullable(),
});

export const CheckoutSchema = z.object({
  debtIds: z.array(z.string().min(1)).min(1).max(50),
});

export const GenerateDebtSchema = z.object({
  periodYear: z.number().int().min(2020).max(2100),
  periodMonth: z.number().int().min(1).max(12),
  dryRun: z.boolean().default(false),
});

// =====================================================
// ADMIN USERS — schema para Fase 2 (CRUD por superadmin)
// =====================================================

export const AdminUserCreateSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2).max(120),
  password: z.string().min(10).max(72),
  role: z.enum(['superadmin', 'admin', 'editor']).default('admin'),
});

export const AdminUserUpdateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).max(120).optional(),
  role: z.enum(['superadmin', 'admin', 'editor']).optional(),
  password: z.string().min(10).max(72).optional(),
});

export type EventInput = z.infer<typeof EventInputSchema>;
export type AlbumInput = z.infer<typeof AlbumInputSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ContentUpdate = z.infer<typeof ContentUpdateSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type ArticleInput = z.infer<typeof ArticleInputSchema>;
export type AuthorInput = z.infer<typeof AuthorInputSchema>;

export type StudentCreateInput = z.infer<typeof StudentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof StudentUpdateSchema>;
export type StudentLoginInput = z.infer<typeof StudentLoginSchema>;
export type FeeRuleInput = z.infer<typeof FeeRuleSchema>;
export type LateSurchargeRuleInput = z.infer<typeof LateSurchargeRuleSchema>;
export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type ManualPaymentInput = z.infer<typeof ManualPaymentSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type GenerateDebtInput = z.infer<typeof GenerateDebtSchema>;
export type AdminUserCreateInput = z.infer<typeof AdminUserCreateSchema>;
export type AdminUserUpdateInput = z.infer<typeof AdminUserUpdateSchema>;
