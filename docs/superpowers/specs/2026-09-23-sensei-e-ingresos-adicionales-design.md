# Spec — Rol Sensei + Ingresos Adicionales

**Fecha:** 2026-09-23
**Autor:** brainstorming con Giuliano Crenna
**Estado:** pendiente de aprobación

## Objetivo

1. Introducir un nuevo rol **`sensei`** con permisos equivalentes a superadmin excepto por **Cron jobs** e **Integraciones**.
2. Crear el módulo de **Ingresos Adicionales** (modelo `Income`) para registrar donaciones, recaudaciones de eventos, sponsors, rifas, ventas de merchandising y alquileres del dojo.
3. Permitir que sensei gestione usuarios admin (incluyendo otros senseis) y gastos.
4. Endurecer la pantalla de Integraciones para que solo superadmin la acceda.

## Contexto actual

- Roles existentes en `AdminUser.role` (String): `superadmin | admin | editor`.
- Guards: `requireAdmin()`, `requireRole(SUPERADMIN)`, `requireRole(SUPERADMIN, ADMIN)`.
- Página `/admin/cron`: `requireRole(SUPERADMIN, ADMIN)` — admin puede ver y disparar crons.
- Página `/admin/integraciones`: `requireAdmin()` — cualquier sesión edita Mercado Pago, WaSender, Email y Drive. Es un agujero de seguridad que se corrige con este cambio.
- Página `/admin/usuarios` y API `/api/admin-users*`: `requireRole(SUPERADMIN)` / `s.role !== 'superadmin'`.
- Gastos ya implementados: modelo `Expense`, CRUD en `/admin/pagos/gastos`, API `/api/pagos/expenses`, auditoría y reportes.
- **Ingresos adicionales no existen.** El único modelo de dinero entrante es `Payment`, que representa pagos de cuotas de alumnos.

## Decisiones tomadas en brainstorming

| Tema | Decisión |
|---|---|
| Permisos de sensei | Todo como superadmin, excepto Cron jobs e Integraciones |
| Apartado gastos | Ya está completo, solo se asegura que sensei tenga acceso (queda dentro de `requireAdmin()`) |
| Ingresos adicionales: alcance | Donaciones, eventos, sponsors, rifas, ventas, alquileres |
| Ingresos adicionales: vinculación a alumno | NO — modelo libre. Campo `source` (string) para identificar donante/origen |
| Integraciones: ¿bloquear admin también? | SÍ — solo superadmin |
| Sensei: ¿CRUD usuarios admin? | SÍ — incluye crear/editar otros senseis |

## Diseño

### 1. Schema Prisma

#### Modelo nuevo `Income`

```prisma
// =====================================================
// INGRESOS ADICIONALES — donaciones, eventos, sponsors, rifas, ventas, alquileres.
// Separado de Payment (cuotas de alumnos).
// =====================================================
model Income {
  id                String   @id @default(cuid())
  category          String   // donacion | evento | sponsor | rifa | venta | alquiler | otro
  description       String
  amount            Decimal  @db.Decimal(10, 2)
  occurredAt        DateTime
  source            String?  // nombre libre del donante / organizador / origen
  method            String   // cash | transfer | mercadopago | other
  receiptDriveFileId String?
  notes             String?
  recordedBy        String?  // adminUserId
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([occurredAt])
  @@index([category])
}
```

#### `AdminUser.role`

Sin cambios en DB (el campo ya es `String`). Solo se amplía el set de valores válidos en código: `'superadmin' | 'sensei' | 'admin' | 'editor'`.

### 2. Sistema de permisos

#### `src/lib/guards.ts`

```ts
export type AdminRole = 'superadmin' | 'sensei' | 'admin' | 'editor';

export const SUPERADMIN: AdminRole = 'superadmin';
export const SENSEI: AdminRole = 'sensei';
export const ADMIN: AdminRole = 'admin';
export const EDITOR: AdminRole = 'editor';
```

#### Matriz efectiva

| Sección | superadmin | sensei | admin | editor |
|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Alumnos (CRUD + perfil + certificados) | ✓ | ✓ | ✓ | lectura |
| Pagos / Deudas / Cuotas / Reportes | ✓ | ✓ | ✓ | – |
| Gastos | ✓ | ✓ | ✓ | – |
| **Ingresos** (nuevo) | ✓ | ✓ | ✓ | – |
| Eventos / Álbumes / Artículos / Autores / Contenido | ✓ | ✓ | ✓ | ✓ |
| Notificaciones (test) | ✓ | ✓ | ✓ | – |
| **Cron jobs** | ✓ | **✗** | ✓ | – |
| **Integraciones** | ✓ | **✗** | **✗** | – |
| **Usuarios admin (CRUD)** | ✓ | ✓ | ✗ | ✗ |

#### Cambios concretos en páginas y APIs

| Archivo | Cambio |
|---|---|
| `src/app/admin/integraciones/page.tsx` | `requireAdmin()` → `requireRole(SUPERADMIN)` |
| `src/app/admin/cron/page.tsx` | Sin cambios (`requireRole(SUPERADMIN, ADMIN)` ya excluye sensei) |
| `src/app/admin/usuarios/page.tsx` | `requireRole(SUPERADMIN)` → `requireRole(SUPERADMIN, SENSEI)` |
| `src/app/admin/usuarios/nuevo/page.tsx` | Mismo cambio |
| `src/app/admin/usuarios/[id]/page.tsx` | Mismo cambio |
| `src/app/api/admin-users/route.ts` | `requireSuperadminOr401()` → acepta también `sensei` |
| `src/app/api/admin-users/[id]/route.ts` | Mismo cambio |
| `src/app/admin/pagos/gastos/page.tsx`, `gastos/nuevo`, `gastos/[id]` | Sin cambios (`requireAdmin()` ya cubre sensei) |
| `src/app/admin/pagos/page.tsx` | Agregar link a `/admin/pagos/ingresos` |

#### Sidebar `AdminShell.tsx`

Reemplazar `superadminOnly: boolean` por `allowed?: (role: AdminRole) => boolean`. Items relevantes:

```ts
{ href: '/admin/cron', allowed: (r) => r === 'superadmin' || r === 'admin' }
{ href: '/admin/integraciones', allowed: (r) => r === 'superadmin' }
{ href: '/admin/usuarios', allowed: (r) => r === 'superadmin' || r === 'sensei' }
```

Los demás items quedan `allowed` undefined → visibles para todos los roles con sesión.

### 3. Módulo de ingresos (siguiendo el patrón de gastos)

#### Validación (`src/lib/validation.ts`)

```ts
export const IncomeCategoryEnum = z.enum([
  'donacion',
  'evento',
  'sponsor',
  'rifa',
  'venta',
  'alquiler',
  'otro',
]);

export const IncomeMethodEnum = z.enum(['cash', 'transfer', 'mercadopago', 'other']);

export const IncomeSchema = z.object({
  category: IncomeCategoryEnum,
  description: z.string().min(2).max(300),
  amount: z.number().min(0).max(10000000),
  occurredAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida'),
  source: z.string().max(160).optional().nullable(),
  method: IncomeMethodEnum,
  receiptDriveFileId: z.string().min(10).max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const IncomeUpdateSchema = IncomeSchema.partial();
```

#### API

- `GET /api/pagos/incomes` — filtros por `category`, `occurredFrom`, `occurredTo`, paginación `limit`/`offset`. Requiere `requireAdmin()` (cualquiera con sesión: superadmin, sensei, admin).
- `POST /api/pagos/incomes` — crea. AuditLog `create_income`.
- `GET /api/pagos/incomes/[id]` — detalle.
- `PATCH /api/pagos/incomes/[id]` — actualiza. AuditLog `update_income`.
- `DELETE /api/pagos/incomes/[id]` — elimina. AuditLog `delete_income`.

#### UI (espejo de gastos)

- `/admin/pagos/ingresos` — listado + botón "Nuevo ingreso".
- `/admin/pagos/ingresos/nuevo` — formulario.
- `/admin/pagos/ingresos/[id]` — edición.
- Componentes: `IncomeTable`, `IncomeForm`, `IncomeRowActions` — siguen exactamente la estructura de sus contrapartes `Expense*`.
- `AdminShell`: link "Ingresos" en la sección de Pagos (similar a "Gastos").

### 4. Reportes

`src/app/admin/pagos/reportes/page.tsx`:

- Nueva query para ingresos del rango de 12 meses (mismo `where` que gastos pero sobre `Income`).
- Serie "Ingresos" en el chart mensual: `monthly: { revenue, expenses, additionalIncome }`.
- KPI "Ingresos del mes" sumado al bloque existente (no rompe layout).
- `StudentReportsCharts` recibe `additionalIncome` y muestra la nueva serie.

### 5. Form de usuarios admin

`src/components/admin/AdminUserForm.tsx`:

- Agregar `{ value: 'sensei', label: 'Sensei' }` al array `ROLES`.
- `AdminUserCreateSchema` / `AdminUserUpdateSchema`: `z.enum(['superadmin', 'sensei', 'admin', 'editor'])`.

### 6. Auditoría

Cada acción sobre `Income` queda registrada en `AuditLog` con `entity: 'income'`, `entityId: id`, `metadata: JSON con campos clave`.

Los cambios de rol sobre usuarios admin ya se registran (`create_admin_user`, `update_admin_user`, `delete_admin_user`). No requiere cambios.

### 7. Reglas de protección

- **Último superadmin**: ya existe, se mantiene.
- **Sensei**: extender la regla para no permitir eliminar/degradar al único sensei si no queda ninguno (paridad). Si queda el último sensei, no se puede borrar ni degradar a `admin` o `editor`.

## Archivos afectados

### Nuevos

- `prisma/migrations/<ts>_income/` (generado por `prisma migrate dev`)
- `src/app/admin/pagos/ingresos/page.tsx`
- `src/app/admin/pagos/ingresos/nuevo/page.tsx`
- `src/app/admin/pagos/ingresos/[id]/page.tsx`
- `src/app/api/pagos/incomes/route.ts`
- `src/app/api/pagos/incomes/[id]/route.ts`
- `src/components/admin/IncomeTable.tsx`
- `src/components/admin/IncomeForm.tsx`
- `src/components/admin/IncomeRowActions.tsx`

### Modificados

- `prisma/schema.prisma` — modelo `Income`
- `src/lib/guards.ts` — tipo `AdminRole`, constante `SENSEI`
- `src/lib/validation.ts` — `IncomeSchema`, `IncomeUpdateSchema`, enums; extender `AdminUser*Schema`
- `src/app/admin/usuarios/page.tsx`
- `src/app/admin/usuarios/nuevo/page.tsx`
- `src/app/admin/usuarios/[id]/page.tsx`
- `src/app/api/admin-users/route.ts`
- `src/app/api/admin-users/[id]/route.ts`
- `src/app/admin/integraciones/page.tsx` — `requireRole(SUPERADMIN)`
- `src/components/admin/AdminShell.tsx` — nav por rol
- `src/components/admin/AdminUserForm.tsx` — selector con `sensei`
- `src/app/admin/pagos/page.tsx` — link a ingresos
- `src/app/admin/pagos/reportes/page.tsx` — serie ingresos
- `src/components/admin/StudentReportsCharts.tsx` — prop `additionalIncome`

## Plan de validación

1. `npx prisma format && npx prisma migrate dev --name income` genera migración y aplica cambios localmente.
2. `npx tsc --noEmit` para verificar tipos en todo el proyecto.
3. Crear usuario de prueba con rol `sensei` vía API. Verificar que:
   - Acceso a `/admin/usuarios` ✓
   - Acceso a `/admin/cron` redirige a `/admin/dashboard` ✗
   - Acceso a `/admin/integraciones` redirige a `/admin/dashboard` ✗
   - Acceso a `/admin/pagos/ingresos` ✓
   - Crear ingreso vía formulario ✓
   - Ver ingreso en reportes ✓
4. Verificar admin existente:
   - Sigue accediendo a `/admin/cron` ✓
   - Pierde acceso a `/admin/integraciones` (redirige) ✗
   - Sigue accediendo a `/admin/usuarios` → redirige a dashboard ✗
5. Verificar superadmin: acceso total.

## Riesgos y notas

- **Cambio de permisos en `/admin/integraciones`**: cualquier admin que hoy dependa de esa pantalla va a perder acceso. Es un cambio deliberado; el superadmin sigue siendo el único que edita credenciales.
- **Sensei con CRUD sobre usuarios admin**: un sensei podría degradar a otro sensei o admin. Las reglas de "último superadmin" se extienden a "último sensei" para evitar dejar al sistema sin nadie con ese rol.
- **No se agrega UI para "administrar senseis" por separado**: la pantalla `/admin/usuarios` ya cubre CRUD y queda compartida con superadmin.
- **No se cambian los endpoints de cron**: las API internas `/api/cron/*` siguen autenticadas por `cron-secret`. El bloqueo es solo de UI/API admin.
