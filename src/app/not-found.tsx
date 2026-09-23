import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-display text-7xl text-shiroi-700 mb-4">404</div>
        <h1 className="font-display text-2xl text-ink-50 mb-3">Página no encontrada</h1>
        <p className="text-sm text-ink-400 mb-6">
          La ruta que buscás no existe. Volvé al inicio o explorá nuestras secciones.
        </p>
        <Link href="/" className="btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
