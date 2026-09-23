// Tipos compartidos del proyecto

export type EventCategory = 'torneo' | 'examen' | 'seminario' | 'exhibicion' | 'entrenamiento' | 'otro';
export type EventStatus = 'upcoming' | 'past' | 'cancelled';

export interface EventDTO {
  id: string;
  slug: string;
  title: string;
  date: string; // ISO
  location: string | null;
  description: string;
  category: EventCategory;
  coverImage: string | null;
  status: EventStatus;
  featured: boolean;
  album: { id: string; slug: string; title: string } | null;
}

export interface AlbumDTO {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  date: string; // ISO
  coverImageId: string | null;
  driveFolderId: string;
  driveFolderPath: string | null;
  photoCount: number;
  featured: boolean;
  published: boolean;
}

export interface DrivePhotoDTO {
  id: string;
  driveFileId: string;
  name: string;
  mimeType: string;
  mediaType: 'image' | 'video';
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  thumbnailUrl: string | null;
  viewUrl: string | null;
  downloadUrl: string | null;
}

export interface DojoKunPrinciple {
  number: number;
  original: string;
  romaji: string;
  translation: string;
  explanation: string;
}

export interface KataDTO {
  number: number;
  name: string;
  romaji: string;
  kanji: string;
  meaning: string;
  movements: number;
  level: 'introductorio' | 'básico' | 'intermedio' | 'avanzado';
  notes?: string;
  videoUrl?: string;
}

// =====================================================
// ALUMNOS, PAGOS Y NOTIFICACIONES — DTOs Fase 2+
// =====================================================

export type AdminRole = 'superadmin' | 'admin' | 'editor';

export type Belt = 'blanca' | 'amarilla' | 'naranja' | 'verde' | 'azul' | 'marfil' | 'negra';

export type DebtStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';
export type PaymentMethod = 'mercadopago' | 'manual' | 'cash' | 'transfer';

export interface StudentProfileDTO {
  weightKg: number | null;
  heightCm: number | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  medicalNotes: string | null;
  allergies: string | null;
  photoDriveFileId: string | null;
  attendanceDaysPerWeek: number;
  belt: Belt | null;
  notes: string | null;
}

export interface StudentDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dni: string | null;
  phone: string | null;
  whatsapp: string | null;
  birthDate: string | null;
  active: boolean;
  joinedAt: string;
  mustChangePwd: boolean;
  profile: StudentProfileDTO | null;
}

export interface CertificateDTO {
  id: string;
  studentId: string;
  title: string;
  type: string;
  issuedAt: string;
  driveFileId: string;
  fileMimeType: string;
  fileName: string;
  notes: string | null;
}

export interface FeeRuleDTO {
  id: string;
  name: string;
  daysPerWeek: number;
  monthlyAmount: number;
  effectiveFrom: string;
  effectiveUntil: string | null;
  active: boolean;
}

export interface LateSurchargeRuleDTO {
  id: string;
  name: string;
  graceDays: number;
  surchargePct: number;
  active: boolean;
  effectiveFrom: string;
  effectiveUntil: string | null;
}

export interface DebtDTO {
  id: string;
  studentId: string;
  studentName: string;
  periodYear: number;
  periodMonth: number;
  baseAmount: number;
  surchargeAmount: number;
  manualAdjustment: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: DebtStatus;
  manualNote: string | null;
  notes: string | null;
}

export interface PaymentDTO {
  id: string;
  studentId: string;
  studentName: string;
  debtId: string | null;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  mpPaymentId: string | null;
  mpPreferenceId: string | null;
  receiptUrl: string | null;
}

export interface ExpenseDTO {
  id: string;
  category: string;
  description: string;
  amount: number;
  occurredAt: string;
  vendor: string | null;
  notes: string | null;
}

export interface AdminUserDTO {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
}

// =====================================================
// CRON RUNS — log de ejecuciones de cron jobs
// =====================================================
export type CronJobName = 'monthly_debts' | 'overdue_check';
export type CronTrigger = 'cron_vercel' | 'manual_admin' | 'manual_superadmin' | 'system';
export type CronStatus = 'running' | 'success' | 'failed';

export interface CronRunDTO {
  id: string;
  jobName: CronJobName;
  status: CronStatus;
  trigger: CronTrigger;
  triggeredBy: string | null;
  triggeredByEmail: string | null; // joined from AdminUser
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  metadata: Record<string, unknown> | null;
  errorMessage: string | null;
}
