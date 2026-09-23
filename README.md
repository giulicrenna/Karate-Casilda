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
│   ├── schema.prisma       # Modelo de datos
│   └── seed.ts             # Seed inicial (admin, contenido, datos DEMO)
├── public/                 # Assets estáticos (favicon, robots.txt)
├── src/
│   ├── app/                # App Router
│   │   ├── (public)/       # Rutas públicas
│   │   │   ├── historia/
│   │   │   ├── shotokan/
│   │   │   ├── skif/
│   │   │   ├── dojo-kun/
│   │   │   ├── kata/
│   │   │   ├── tecnicas/
│   │   │   ├── eventos/[slug]/
│   │   │   ├── galeria/[slug]/
│   │   │   └── contacto/
│   │   ├── admin/          # Panel de administración
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── eventos/
│   │   │   ├── albumes/
│   │   │   └── contenido/
│   │   ├── api/            # API Routes (auth, eventos, álbumes, contenido)
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/         # Navbar, Footer
│   │   ├── sections/       # Hero, SectionHeader, EventCard, AlbumCard
│   │   ├── admin/          # LoginForm, AdminShell, EventForm, AlbumForm, ContentEditor
│   │   └── gallery/        # GalleryGrid con lightbox
│   ├── lib/                # db, auth, validation, utils, constants
│   ├── services/           # google-drive (encapsula la API de Drive)
│   ├── styles/             # globals.css
│   └── types/              # Tipos compartidos
├── .env.example            # Plantilla de variables de entorno
├── next.config.mjs
├── tailwind.config.ts
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

# Usuario administrador inicial
ADMIN_EMAIL="admin@karatecasilda.local"
ADMIN_PASSWORD="una-clave-segura-de-al-menos-8-chars"

# URL del sitio
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
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

Definidas en `.env.local`:

```
ADMIN_EMAIL
ADMIN_PASSWORD
```

> ⚠️ Por seguridad, **cambiá la contraseña** después del primer login (próximamente: pantalla de cambio de password). Mientras tanto, podés cambiarla ejecutando:
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

## 🌐 Deploy en Vercel

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
