# Karate Casilda — Dojo Shiroi Ryu

Sitio web institucional del **Dojo Shiroi Ryu**, un dojo de karate tradicional **Shotokan SKIF** en Casilda, Santa Fe, Argentina.

Construido con **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma + SQLite/PostgreSQL** y optimizado para deploy en **Vercel**.

---

## ✨ Qué hace

- 🏛️ **Sitio público** con secciones de historia, Shotokan, SKIF, Dojo Kun, Kata, Técnicas, Eventos, Galería y Contacto
- 🔐 **Panel de administración** (`/admin`) con autenticación segura
- 📅 **Gestión de eventos** (torneos, exámenes, seminarios, exhibiciones)
- 📸 **Sistema de álbumes** con sincronización desde **Google Drive** — sin almacenar las fotos originales en Vercel
- 🖼️ **Galería con lightbox**, descarga de originales, lazy loading
- ✍️ **Editor de contenido** para textos institucionales, contacto, Dojo Kun
- 🥋 **Gestión de alumnos** con portal propio (`/alumno`) — login, perfil, certificados, deudas
- 💸 **Sistema de cuotas mensuales** con motor de cálculo por días/semana, recargos por mora, gastos del dojo y reportes
- 💳 **Pagos online con Mercado Pago** (sandbox + producción) — webhooks firmados y reconciliación idempotente
- 📲 **Notificaciones automáticas**: email vía Resend + WhatsApp vía WaSender (pagos recibidos, recordatorios, morosos)
- ⏰ **Cron jobs en Vercel** — generación mensual de deudas + recordatorios diarios, disparables también manualmente
- 🔍 **SEO** completo: sitemap, robots, Open Graph, metadata por página
- 📱 **Responsive** y optimizado para mobile

---

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend & SSR | Next.js 14 App Router, React 18, TypeScript |
| Estilos | Tailwind CSS 3, fuentes: Inter (sans), Cormorant Garamond (display) |
| Base de datos | Prisma ORM + SQLite (desarrollo) / PostgreSQL (producción, recomendado) |
| Autenticación | Sesiones HTTP-only firmadas (HMAC-SHA256) + bcryptjs |
| Almacenamiento de fotos | Google Drive API (vía googleapis SDK) |
| Iconos | lucide-react |
| Deploy | Vercel |

---

## 📂 Estructura del proyecto

```
karate-casilda/
├── docs/
│   ├── research/           # Investigación histórica (no se deploya)
│   └── GOOGLE_DRIVE_SETUP.md
├── prisma/
│   ├── schema.prisma       # Modelo de datos (sitio, alumnos, cuotas, pagos, gastos)
│   └── seed.ts             # Seed inicial (superadmin, contenido, datos DEMO)
├── public/                 # Assets estáticos (favicon, robots.txt)
├── src/
│   ├── app/                # App Router
│   │   ├── (public)/       # Rutas públicas (historia, shotokan, eventos, galería…)
│   │   ├── admin/          # Panel de administración (eventos, alumnos, pagos, cuotas, integraciones…)
│   │   ├── alumno/         # Portal del alumno (login, dashboard, deuda, certificados, perfil)
│   │   ├── api/            # API Routes (auth, eventos, alumnos, pagos, cuotas, cron…)
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── admin/          # AdminShell, formularios, tablas, charts
│   │   ├── alumno/         # PortalShell, PayButton, DebtCard, ProfileForm…
│   │   ├── layout/         # Navbar, Footer
│   │   ├── sections/       # Hero, SectionHeader, EventCard, AlbumCard
│   │   └── gallery/        # GalleryGrid con lightbox
│   ├── lib/                # db, auth, auth-student, guards, validation, fee-engine, schedule, money, secrets, rate-limit, cron-secret, site-url
│   ├── services/           # google-drive, mercadopago, wasender, email, payments/{fee-engine,reconcile,notifications,cron-jobs}
│   ├── styles/             # globals.css
│   └── types/              # Tipos compartidos + DTOs
├── .env.example            # Plantilla de variables de entorno
├── next.config.mjs
├── tailwind.config.ts
├── vercel.json             # Cron jobs declarados
└── package.json
```

---

## 🚀 Instalación local

### 1. Requisitos
- **Node.js 18+** (recomendado 20 o 22)
- **npm** o **yarn**

### 2. Clonar e instalar
```bash
git clone <repo>
cd karate-casilda
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Editá `.env.local` y configurá **al menos** estas variables (lo demás puede quedar para después):

```bash
# Generá un secret seguro con:
openssl rand -base64 32
SESSION_PASSWORD="<pegar_el_secreto_aquí>"

# Usuario superadmin inicial (lo crea el seed)
SUPERADMIN_EMAIL="admin@karatecasilda.local"
SUPERADMIN_PASSWORD="una-clave-segura-de-al-menos-10-chars"

# URL del sitio
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Cron secret (producción): Vercel Cron lo usa como Bearer token
# Generalo con: openssl rand -hex 32
CRON_SECRET="<pegar_el_secreto_aquí>"
```

> Las variables de Google Drive **no son necesarias para arrancar el sitio** (la galería funcionará con placeholders). Configuralas cuando quieras asociar una carpeta real.

### 4. Inicializar la base de datos
```bash
npm run db:push         # crea el schema en SQLite
npm run db:seed         # crea el admin inicial + contenido DEMO
```

### 5. Levantar el dev server
```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para ver el sitio público y [http://localhost:3000/admin/login](http://localhost:3000/admin/login) para entrar al panel.

---

## 👤 Credenciales del admin inicial

Definidas en `.env.local` (el superadmin se crea al ejecutar `npm run db:seed`):

```
SUPERADMIN_EMAIL
SUPERADMIN_PASSWORD
```

> Por seguridad, **cambiá la contraseña** después del primer login desde `/admin/usuarios`. Si necesitás resetear la password del superadmin por línea de comandos:
> ```bash
> node -e "const {PrismaClient} = require('@prisma/client'); const bcrypt = require('bcryptjs'); const p = new PrismaClient(); bcrypt.hash('NUEVA_CLAVE', 12).then(h => p.adminUser.update({where:{email:'admin@karatecasilda.local'}, data:{passwordHash:h}}).then(()=>console.log('OK')).finally(()=>p.\$disconnect()));"
> ```

---

## 📸 Configurar Google Drive (galería real)

Ver [`docs/GOOGLE_DRIVE_SETUP.md`](./docs/GOOGLE_DRIVE_SETUP.md) para el paso a paso completo.

Resumen rápido:

1. Crear proyecto en Google Cloud Console
2. Habilitar **Google Drive API**
3. Crear credenciales **OAuth 2.0** (tipo Web application)
4. Obtener **Refresh Token** vía flujo OAuth
5. Compartir la carpeta de Drive con el email del Service Account (o la cuenta autorizada)
6. Definir las 4 variables de entorno en `.env.local` (y en Vercel):
   ```
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   GOOGLE_REFRESH_TOKEN
   GOOGLE_DRIVE_ROOT_FOLDER_ID
   ```
7. Crear un álbum desde `/admin/albumes/nuevo` con el ID de la carpeta
8. Sincronizar (botón en la lista de álbumes)

---

## ⚙️ Configuración del entorno

Estas son todas las variables de entorno reconocidas. Lo mínimo para arrancar el sitio está más arriba (sección "Instalación local").

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `DATABASE_URL` | sí | URL de Postgres/Neon. |
| `SESSION_PASSWORD` | sí | Secret HMAC para firmar cookies (mín. 32 chars). |
| `SUPERADMIN_EMAIL` | opcional | Email del superadmin inicial (lo usa `db:seed`). |
| `SUPERADMIN_PASSWORD` | opcional | Contraseña del superadmin inicial. |
| `SESSION_COOKIE_NAME` | opcional | Nombre de cookie admin (default `karate_session`). |
| `STUDENT_COOKIE_NAME` | opcional | Nombre de cookie de alumnos (default `karate_student_session`). |
| `NEXT_PUBLIC_SITE_URL` | opcional | URL pública del sitio. Se usa para construir links en emails y WhatsApp. |
| `CRON_SECRET` | producción | Token Bearer que Vercel Cron envía al ejecutar `/api/cron/*`. Generala con `openssl rand -hex 32`. |
| `RESEND_API_KEY` | opcional | API key de Resend (alternativa: configurar desde `/admin/integraciones`). |
| `MERCADOPAGO_*` | opcional | Credenciales sandbox/prod. **Recomendado**: configurarlas desde `/admin/integraciones` (cifradas en DB). |
| `WASENDER_API_KEY` | opcional | API key de WaSender. **Recomendado**: configurarla desde `/admin/integraciones`. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_DRIVE_ROOT_FOLDER_ID` | opcional | Integración con Drive. **Recomendado**: configurarla desde `/admin/integraciones`. |

> **Nota**: las credenciales de Mercado Pago, WaSender, Resend y Google Drive se pueden dejar en `.env.local` *o* cargarse desde el panel `/admin/integraciones` (cifradas con AES-256-GCM en `IntegrationConfig`). El panel tiene precedencia.

---

## 🆕 Funcionalidades nuevas (sistema de alumnos)

- **Alumnos** (`/admin/alumnos`): CRUD completo con perfil (peso, altura, contacto de emergencia, cinturón, días/semana). Auditoría de cada acción.
- **Portal del alumno** (`/alumno`): login, dashboard, perfil, deuda mes a mes, certificados, recuperación de contraseña, forzado de cambio en primer ingreso.
- **Cuotas** (`/admin/cuotas`): reglas de precio por días/semana y reglas de recargo por mora (día de gracia + %).
- **Deudas y pagos** (`/admin/pagos`):
  - Generación mensual automática con dedup (botón "Generar deudas del mes").
  - Tabla de deudas con filtros, ajustes manuales y pagos en efectivo/transferencia.
  - Historial de pagos con pagos manuales y de Mercado Pago.
  - Gastos del dojo (alquiler, sueldos, servicios, etc.).
  - Reportes con charts (revenue vs gastos, cobrabilidad, top deudores).
- **Pagos online** (`/alumno/deuda` → Mercado Pago sandbox o producción): redirect con `back_urls` al portal; webhook firmado HMAC-SHA256 → reconciliación idempotente de `Payment` + recálculo de `Debt`.
- **Notificaciones automáticas**:
  - **Email** (Resend) y **WhatsApp** (WaSender API) al recibir un pago, al vencer el mes, al atrasarse, en bienvenida y al resetear contraseña.
  - **Deduplicación diaria** vía `NotificationLog` (no se manda el mismo template dos veces el mismo día).
  - Bitácora en `/admin/notificaciones` con filtros por canal, estado, plantilla y fechas.
- **Integraciones** (`/admin/integraciones`): formularios para Mercado Pago, WaSender, Resend y Google Drive. Las credenciales se guardan cifradas.

---

## ⏰ Cron jobs

Declarados en `vercel.json`. Vercel los ejecuta automáticamente con header `Authorization: Bearer ${CRON_SECRET}`.

| Path | Schedule (UTC) | Hora local AR | Qué hace |
|------|----------------|---------------|----------|
| `/api/cron/monthly` | `5 0 1 * *` | día 1 de cada mes a las 21:05 AR (del último día del mes anterior) | Genera las deudas del mes anterior para todos los alumnos activos y envía recordatorios. |
| `/api/cron/overdue` | `0 13 * *` | cada día a las 10:00 AR | Marca como `overdue` las deudas vencidas y notifica a los deudores (con dedup diario). |

**Disparo manual**: en `/admin/pagos` hay un menú "Cron manual" con botones para correr ambos jobs sin necesidad de `CRON_SECRET` (usa la sesión admin). Útil para testing o para forzar la corrida tras un corte.

**Probar manualmente con curl**:

```bash
# Mensual
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://tu-dominio/api/cron/monthly

# Morosos
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://tu-dominio/api/cron/overdue
```

También soportan `GET` como probe (devuelve 200 + mensaje si el secret es válido).

---

### Opción A: desde GitHub
1. Pusheá el repo a GitHub
2. Entrá a [vercel.com](https://vercel.com) → New Project → importá el repo
3. Configurá las **Environment Variables** (las mismas del `.env.local`)
4. Deploy

### Opción B: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Base de datos en producción

SQLite **no es ideal para producción**. Recomendamos **Vercel Postgres**:

1. En el dashboard de Vercel: **Storage** → **Create Database** → **Postgres**
2. Copiá la `DATABASE_URL` que Vercel te da
3. Cambiá `provider` en `prisma/schema.prisma` de `"sqlite"` a `"postgresql"`
4. Hacé commit y redeployá:
   ```bash
   npm run db:push
   npm run db:seed   # opcional, solo la primera vez
   ```

> **Costo**: Vercel Postgres tiene un tier gratuito limitado pero suficiente para un sitio como este. Para escalar, evaluá Neon, Supabase o Railway.

---

## 🧰 Scripts útiles

```bash
npm run dev          # dev server
npm run build        # build de producción
npm run start        # correr build local
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run db:push      # aplica schema a la DB
npm run db:generate  # regenera Prisma client
npm run db:seed      # ejecuta el seed (admin + DEMO)
```

---

## 📑 Investigación histórica

Toda la investigación realizada para los textos del sitio está en `docs/research/`:

- `shotokan-history.md` — Historia del karate, Shotokan, SKIF, Dojo Kun, Kata
- `local-context.md` — Karate en Argentina, SKIF Argentina, Dojo Shiroi Ryu

> Importante: cuando algún dato del dojo local no se pudo verificar públicamente, se marcó como **PENDIENTE DE VALIDACIÓN** y se cargó como campo editable desde el panel `/admin/contenido`. El sensei responsable debe completar esa información.

---

## 🔒 Seguridad

- **Secretos**: nunca commitees `.env.local`. Todas las credenciales de Google viven en el servidor.
- **Sesiones**: cookies HTTP-only, Secure en producción, mismas Lax, firmadas con HMAC-SHA256.
- **Contraseñas**: hasheadas con bcrypt (12 rounds).
- **Rate limiting**: 5 intentos de login cada 15 min por IP.
- **Validación**: Zod en todos los endpoints.
- **CSP/Security headers**: configurados en `next.config.mjs`.
- **Admin**: la ruta `/admin/*` está bloqueada para indexación en `robots.ts`.

---

## 🧪 Datos DEMO

El seed crea:

- 1 usuario administrador (con las credenciales del `.env.local`)
- 1 evento DEMO claramente marcado como `[DEMO]`
- 1 álbum DEMO con `driveFolderId=DEMO_FOLDER_ID_REEMPLAZAR`
- Contenido institucional inicial para todas las secciones

El prefijo `[DEMO]` indica que el contenido es de prueba y debe reemplazarse.

---

## ❓ Solución de problemas

| Problema | Solución |
|----------|----------|
| "No autorizado" al entrar a /admin | Verificá que la cookie no esté bloqueada y que `SESSION_PASSWORD` esté definida en `.env.local`. |
| "Google Drive no está configurado" | Definí las 4 variables en `.env.local` y reiniciá el server. |
| "Demasiados intentos" en login | Esperá 15 minutos o reiniciá el dev server (el rate-limit es en memoria). |
| Las fotos no aparecen | Verificá que la carpeta de Drive esté compartida con la cuenta autorizada y que el `driveFolderId` sea correcto. Sincronizá desde el botón en `/admin/albumes`. |
| Error en build de Prisma | Asegurate de haber corrido `npm install` (postinstall genera el client). Si no, ejecutá `npm run db:generate`. |

---

## 📜 Licencia

Privado. Todos los derechos reservados por Karate Casilda — Dojo Shiroi Ryu.

El código puede adaptarse para otros dojos con atribución.

---

## 🙏 Créditos

- **Investigación histórica**: ver `docs/research/shotokan-history.md` para la lista completa de fuentes (JKA, SKIF, Wikipedia, KarateDecoded, etc.)
- **Diseño y desarrollo**: construido con foco en tradición, minimalismo y fotografía.
- **Tipografía**: [Inter](https://rsms.me/inter/) + [Cormorant Garamond](https://github.com/CatharsisFonts/Cormorant)
