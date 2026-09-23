# public/static/

Carpeta para archivos importantes que se sirven desde el sitio.

Cualquier archivo que pongas acá es accesible públicamente en la URL
`https://<dominio>/static/<archivo>` (por ejemplo `public/static/manual.pdf` →
`/static/manual.pdf`).

Uso típico: PDFs, reglamentos, formularios, planos, recursos descargables.

**No** pongas acá datos sensibles (claves, tokens, datos personales): este
directorio es público. Para eso usar variables de entorno o archivos fuera
de `public/`.
