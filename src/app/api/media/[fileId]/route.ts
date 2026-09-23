import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import { google } from 'googleapis';
import { getServiceAccountCredentials } from '@/lib/google-credentials';

export const runtime = 'nodejs';
// ponytail: proxy range-aware para video streaming. Único punto donde
// el binario cruza la frontera SA-only ↔ browser. Sin esto, webContentLink
// requiere sesión de Drive y no funciona para visitantes anónimos.

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  if (!/^[a-zA-Z0-9_-]+$/.test(params.fileId)) {
    return NextResponse.json({ error: 'fileId inválido' }, { status: 400 });
  }

  const credentials = await getServiceAccountCredentials();
  if (!credentials) {
    return NextResponse.json({ error: 'Drive no configurado' }, { status: 503 });
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });

  const meta = await drive.files.get({
    fileId: params.fileId,
    fields: 'mimeType,name,size',
    supportsAllDrives: true,
  });
  const mimeType = meta.data.mimeType ?? 'application/octet-stream';
  const size = Number(meta.data.size ?? 0);
  const fileName = meta.data.name ?? 'download';

  const headers: Record<string, string> = {
    'Accept-Ranges': 'bytes',
    'Content-Type': mimeType,
    'Cache-Control': 'public, max-age=3600',
    'Content-Disposition': new URL(req.url).searchParams.get('download')
      ? `attachment; filename="${fileName.replace(/"/g, '')}"`
      : 'inline',
  };

  const rangeHeader = req.headers.get('range');
  const rangeMatch = rangeHeader?.match(/^bytes=(\d+)-(\d*)$/);

  if (rangeMatch && size > 0) {
    const start = Number(rangeMatch[1]);
    const end = rangeMatch[2]
      ? Number(rangeMatch[2])
      : Math.min(start + 1024 * 1024 - 1, size - 1);

    if (start >= size || end >= size) {
      return new NextResponse('Range not satisfiable', {
        status: 416,
        headers: { 'Content-Range': `bytes */${size}` },
      });
    }

    const mediaRes = await drive.files.get(
      { fileId: params.fileId, alt: 'media', supportsAllDrives: true },
      { headers: { Range: `bytes=${start}-${end}` }, responseType: 'stream' }
    );

    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    headers['Content-Length'] = String(end - start + 1);

    return new NextResponse(mediaRes.data as unknown as ReadableStream, {
      status: 206,
      headers,
    });
  }

  if (size > 0) headers['Content-Length'] = String(size);
  const mediaRes = await drive.files.get(
    { fileId: params.fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' }
  );

  return new NextResponse(mediaRes.data as unknown as ReadableStream, {
    status: 200,
    headers,
  });
}
