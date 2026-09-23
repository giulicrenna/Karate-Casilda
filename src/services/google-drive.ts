// Servicio de Google Drive — encapsula TODA la lógica de interacción con la API.
// El resto de la app consume solo este servicio.
// Las credenciales NUNCA salen al cliente; todo se ejecuta del lado del servidor.

import 'server-only';
import { google, drive_v3 } from 'googleapis';
import type { DrivePhotoDTO } from '@/types';
import { getServiceAccountCredentials } from '@/lib/google-credentials';

const SCOPES = (process.env.GOOGLE_DRIVE_SCOPES || 'https://www.googleapis.com/auth/drive.readonly').split(
  ','
);

async function isConfigured(): Promise<boolean> {
  return (await getServiceAccountCredentials()) !== null;
}

async function getClient() {
  const credentials = await getServiceAccountCredentials();
  if (!credentials) {
    throw new Error(
      'Google Drive no está configurado. Subí el JSON de la Service Account desde /admin/integraciones.'
    );
  }
  return google.drive({
    version: 'v3',
    auth: new google.auth.GoogleAuth({ credentials, scopes: SCOPES }),
  });
}

const MEDIA_MIME_PREFIXES = ['image/', 'video/'];

function isMedia(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false;
  return MEDIA_MIME_PREFIXES.some((p) => mimeType.startsWith(p));
}

function getMediaType(mimeType: string): 'image' | 'video' {
  return mimeType.startsWith('video/') ? 'video' : 'image';
}

/**
 * Lista archivos multimedia (imágenes y videos) dentro de una carpeta de Google Drive.
 * Maneja paginación automáticamente.
 */
export async function listFolderImages(
  folderId: string,
  opts?: { pageSize?: number; pageToken?: string }
): Promise<{ files: drive_v3.Schema$File[]; nextPageToken: string | null }> {
  const drive = await getClient();
  const pageSize = Math.min(opts?.pageSize ?? 50, 200);

  const res = await drive.files.list({
    q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
    fields:
      'nextPageToken, files(id, name, mimeType, size, imageMediaMetadata, webViewLink, webContentLink, thumbnailLink)',
    pageSize,
    pageToken: opts?.pageToken,
    orderBy: 'name',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return {
    files: (res.data.files ?? []).filter((f) => isMedia(f.mimeType)),
    nextPageToken: res.data.nextPageToken ?? null,
  };
}

/** Devuelve todas las imágenes de una carpeta (pagina automáticamente). */
export async function listAllFolderImages(
  folderId: string,
  max = 1000
): Promise<drive_v3.Schema$File[]> {
  const all: drive_v3.Schema$File[] = [];
  let token: string | undefined = undefined;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { files, nextPageToken } = await listFolderImages(folderId, {
      pageSize: 100,
      pageToken: token,
    });
    all.push(...files);
    if (!nextPageToken || all.length >= max) break;
    token = nextPageToken;
  }
  return all.slice(0, max);
}

/** Obtiene metadata de una carpeta. */
export async function getFolderMetadata(
  folderId: string
): Promise<drive_v3.Schema$File | null> {
  const drive = await getClient();
  const res = await drive.files.get({
    fileId: folderId,
    fields: 'id, name, mimeType, webViewLink, createdTime, modifiedTime',
    supportsAllDrives: true,
  });
  return res.data ?? null;
}

/** Genera URL de thumbnail usando el proxy server-side (evita rate-limit 429). */
function thumbProxyUrl(fileId: string, size: number): string {
  return `/api/thumb/${fileId}?size=${size}`;
}

/** Convierte un file de Drive a un DTO cacheable. */
export function fileToDTO(file: drive_v3.Schema$File): DrivePhotoDTO {
  const mimeType = file.mimeType ?? 'application/octet-stream';
  const mediaType = getMediaType(mimeType);
  const fileId = file.id ?? '';
  return {
    id: fileId,
    driveFileId: fileId,
    name: file.name ?? 'sin-nombre',
    mimeType,
    mediaType,
    width: file.imageMediaMetadata?.width ?? null,
    height: file.imageMediaMetadata?.height ?? null,
    sizeBytes: file.size ? Number(file.size) : null,
    // Todo pasa por proxy server-side: el browser nunca pega directo a Google
    // (rate-limit 429 con Referer). /api/thumb para imágenes, /api/media para binarios.
    thumbnailUrl: fileId ? thumbProxyUrl(fileId, 800) : null,
    viewUrl: fileId
      ? mediaType === 'video'
        ? `/api/media/${fileId}`
        : thumbProxyUrl(fileId, 2200)
      : null,
    downloadUrl: fileId ? `/api/media/${fileId}?download=1` : null,
  };
}

/**
 * Sincroniza el contenido de una carpeta de Drive con la caché local.
 * Estrategia:
 *  - Lee hasta `max` imágenes de Drive.
 *  - Borra de la caché los IDs que ya no existen.
 *  - Upserta cada foto con metadatos frescos.
 * Devuelve la lista final de DTOs.
 */
export async function syncFolderCache(
  folderId: string,
  albumId: string,
  max = 500
): Promise<DrivePhotoDTO[]> {
  const { prisma } = await import('@/lib/db');
  const files = await listAllFolderImages(folderId, max);
  const driveIds = new Set(files.map((f) => f.id!).filter(Boolean));

  // Eliminar entradas de caché que ya no existen
  const cached = await prisma.drivePhotoCache.findMany({
    where: { albumId },
    select: { id: true, driveFileId: true },
  });
  const stale = cached.filter((c) => !driveIds.has(c.driveFileId));
  if (stale.length > 0) {
    await prisma.drivePhotoCache.deleteMany({
      where: { id: { in: stale.map((s) => s.id) } },
    });
  }

  // Upsert
  for (const file of files) {
    if (!file.id) continue;
    const dto = fileToDTO(file);
    await prisma.drivePhotoCache.upsert({
      where: { driveFileId: file.id },
      create: {
        albumId,
        driveFileId: dto.driveFileId,
        name: dto.name,
        mimeType: dto.mimeType,
        mediaType: dto.mediaType,
        width: dto.width,
        height: dto.height,
        sizeBytes: dto.sizeBytes,
        thumbnailUrl: dto.thumbnailUrl,
        viewUrl: dto.viewUrl,
        downloadUrl: dto.downloadUrl,
      },
      update: {
        name: dto.name,
        mimeType: dto.mimeType,
        mediaType: dto.mediaType,
        width: dto.width,
        height: dto.height,
        sizeBytes: dto.sizeBytes,
        thumbnailUrl: dto.thumbnailUrl,
        viewUrl: dto.viewUrl,
        downloadUrl: dto.downloadUrl,
        cachedAt: new Date(),
      },
    });
  }

  // Actualizar contador del álbum
  await prisma.album.update({
    where: { id: albumId },
    data: { photoCount: files.length },
  });

  return files.map(fileToDTO);
}

/** Lee el caché para un álbum (sin tocar Drive). */
export async function getCachedAlbumPhotos(albumId: string): Promise<DrivePhotoDTO[]> {
  const { prisma } = await import('@/lib/db');
  const rows = await prisma.drivePhotoCache.findMany({
    where: { albumId },
    orderBy: { name: 'asc' },
  });
  return rows.map((r) => ({
    id: r.id,
    driveFileId: r.driveFileId,
    name: r.name,
    mimeType: r.mimeType,
    mediaType: (r.mediaType as 'image' | 'video') ?? 'image',
    width: r.width,
    height: r.height,
    sizeBytes: r.sizeBytes,
    thumbnailUrl: r.thumbnailUrl,
    viewUrl: r.viewUrl,
    downloadUrl: r.downloadUrl,
  }));
}

export async function googleDriveConfigured(): Promise<boolean> {
  return isConfigured();
}
