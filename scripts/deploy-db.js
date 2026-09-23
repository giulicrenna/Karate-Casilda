// Aplica los cambios de Prisma schema a la base de datos durante el deploy.
// Estrategia:
//  - Si existe `prisma/migrations/` con migraciones formales, ejecuta `prisma migrate deploy`
//    (recomendado para producción madura).
//  - Si NO existe la carpeta, cae a `prisma db push --skip-generate` (ideal para
//    desarrollo temprano donde aún no hay migraciones formales).
//
// Falla el build si no se puede aplicar el schema, evitando errores en runtime
// tipo "The table `public.X` does not exist".

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
const hasMigrations =
  fs.existsSync(migrationsDir) && fs.readdirSync(migrationsDir).length > 0;

try {
  if (hasMigrations) {
    console.log('→ Aplicando migraciones de Prisma (migrate deploy)...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } else {
    console.log('→ No hay carpeta migrations/, usando prisma db push --skip-generate...');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  }
} catch (e) {
  console.error('✗ Error aplicando cambios a la DB:', e.message);
  process.exit(1);
}
