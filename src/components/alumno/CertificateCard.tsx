import { Download, ExternalLink } from 'lucide-react';

interface CertificateItem {
  id: string;
  title: string;
  type: string;
  driveFileId: string;
  fileMimeType: string;
  fileName: string;
  issuedAt: string;
}

function typeLabel(type: string) {
  switch (type) {
    case 'cinturon':
      return 'Cinturón';
    case 'diploma':
      return 'Diploma';
    case 'asistencia':
      return 'Asistencia';
    default:
      return 'Otro';
  }
}

export default function CertificateCard({ cert }: { cert: CertificateItem }) {
  const issued = new Date(cert.issuedAt).toLocaleDateString('es-AR', { dateStyle: 'medium' });
  const isImage = cert.fileMimeType.startsWith('image/');
  const isPdf = cert.fileMimeType === 'application/pdf';

  return (
    <div className="card-minimal p-4">
      <div className="flex gap-4">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm border border-ink-800 bg-ink-900 grid place-items-center">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/thumb/${cert.driveFileId}?size=200`}
              alt={cert.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-[10px] uppercase tracking-wider text-ink-500">
              {isPdf ? 'PDF' : cert.fileMimeType.split('/')[1]?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-shiroi-500">
            {typeLabel(cert.type)}
          </div>
          <div className="font-display text-sm text-ink-100 truncate">{cert.title}</div>
          <div className="text-xs text-ink-500">{issued}</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <a
          href={`/api/thumb/${cert.driveFileId}?size=1200`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-[10px] flex-1"
        >
          <ExternalLink className="h-3 w-3" />
          Ver
        </a>
        <a
          href={`/api/media/${cert.driveFileId}?download=1`}
          className="btn-primary text-[10px] flex-1"
        >
          <Download className="h-3 w-3" />
          Descargar
        </a>
      </div>
    </div>
  );
}