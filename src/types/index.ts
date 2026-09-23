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
