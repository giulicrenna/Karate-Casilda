import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { google } from 'googleapis';
import { getServiceAccountCredentials } from '@/lib/google-credentials';

const CACHE_DIR = path.join(process.cwd(), '.thumb-cache');
const ALLOWED_SIZES = new Set([400, 800, 1600, 2200]);

export const runtime = 'nodejs';
// ponytail: este proxy evita el rate-limit 429 de Google cuando el browser
// carga thumbnails directos con Referer. Subir a cache distribuido si el
// volumen de tráfico lo justifica.

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  if (!/^[a-zA-Z0-9_-]+$/.test(params.fileId)) {
    return NextResponse.json({ error: 'fileId inválido' }, { status: 400 });
  }

  const sizeParam = Number(new URL(req.url).searchParams.get('size') ?? '800');
  const size = ALLOWED_SIZES.has(sizeParam) ? sizeParam : 800;
  const cacheFile = path.join(CACHE_DIR, `${params.fileId}_${size}.jpg`);

  try {
    const stat = await fs.stat(cacheFile);
    const stream = createReadStream(cacheFile);
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, immutable',
        'X-Cache': 'HIT',
        'Content-Length': String(stat.size),
      },
    });
  } catch {
    // cache miss
  }

  try {
    const credentials = await getServiceAccountCredentials();
    if (!credentials) {
      return NextResponse.json({ error: 'Drive no configurado' }, { status: 503 });
    }
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const authClient = await auth.getClient();
    const tokenResp = await authClient.getAccessToken();
    const token = typeof tokenResp === 'string' ? tokenResp : tokenResp?.token;
    if (!token) {
      return NextResponse.json({ error: 'No se pudo obtener token' }, { status: 500 });
    }

    const drive = google.drive({ version: 'v3', auth });
    const file = await drive.files.get({
      fileId: params.fileId,
      fields: 'thumbnailLink',
      supportsAllDrives: true,
    });

    if (!file.data.thumbnailLink) {
      return NextResponse.json({ error: 'Sin thumbnail' }, { status: 404 });
    }

    const url = `${file.data.thumbnailLink.split('=')[0]}=s${size}`;
    const driveRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!driveRes.ok) {
      return new NextResponse(`Drive ${driveRes.status}`, { status: 502 });
    }

    const buffer = Buffer.from(await driveRes.arrayBuffer());
    fs.mkdir(CACHE_DIR, { recursive: true })
      .then(() => fs.writeFile(cacheFile, buffer))
      .catch(() => {}); // ponytail: cache best-effort, never fail the response

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': driveRes.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, immutable',
        'X-Cache': 'MISS',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}
