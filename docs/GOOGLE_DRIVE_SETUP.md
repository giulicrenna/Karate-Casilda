# Configuración de Google Drive para Karate Casilda

Esta guía explica paso a paso cómo configurar la integración con Google Drive para que la galería funcione con fotos reales, sin almacenar los originales en Vercel.

---

## 🎯 Objetivo

Que la aplicación pueda:

1. Listar imágenes dentro de una carpeta de Google Drive
2. Generar thumbnails cacheables
3. Servir la imagen original a tamaño completo desde Google
4. Permitir descarga directa del original

Las credenciales **nunca** se exponen al cliente. Todo se ejecuta del lado del servidor (API Routes de Next.js).

---

## 1. Crear proyecto en Google Cloud

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear un nuevo proyecto (ej: `karate-casilda`)
3. En la barra lateral: **APIs & Services** → **Library**
4. Buscar **Google Drive API** → **Enable**

---

## 2. Configurar pantalla de consentimiento OAuth

1. **APIs & Services** → **OAuth consent screen**
2. Elegir **External** (a menos que tengas Google Workspace)
3. Completar:
   - App name: `Karate Casilda Web`
   - User support email: tu email
   - Developer contact: tu email
4. **Scopes**: agregar `https://www.googleapis.com/auth/drive.readonly`
5. **Test users**: agregar el email con el que vas a autorizar la app (tu Gmail)
6. Guardar

> Mientras la app esté en modo "Testing", solo los test users podrán autorizar. Si necesitás usuarios adicionales, agregalos acá.

---

## 3. Crear credenciales OAuth 2.0

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Name: `Karate Casilda Web Client`
4. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://tu-dominio.vercel.app
   ```
5. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/google/callback
   https://tu-dominio.vercel.app/api/auth/google/callback
   ```
6. **Create** → guardar el **Client ID** y **Client Secret**

---

## 4. Obtener el Refresh Token

La forma más rápida de obtener un refresh token es con el **OAuth 2.0 Playground**:

1. Ir a [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Arriba a la derecha: ⚙️ → **Use your own OAuth credentials** → pegar tu Client ID y Client Secret
3. En el panel izquierdo, buscar **Drive API v3** → seleccionar `https://www.googleapis.com/auth/drive.readonly`
4. **Authorize APIs** → loguearte con tu Google account → Allow
5. **Exchange authorization code for tokens**
6. Copiar el **Refresh token** (no el access token)

---

## 5. Compartir la carpeta de Drive

1. En Google Drive, crear la estructura:
   ```
   Karate Casilda/
   ├── 2024/
   │   ├── Torneo Casilda 2024/
   │   ├── Examen Diciembre 2024/
   ├── 2025/
   │   ├── Torneo Casilda 2025/
   ├── 2026/
   │   ├── Torneo Casilda 2026/
   │   ├── Examen Julio 2026/
   │   ├── Seminario 2026/
   ```

2. Para cada carpeta de álbum, hacer click derecho → **Share** → agregar el email de la cuenta Google que usaste en el paso 4 (la dueña del refresh token) con permiso **Viewer**.

> Importante: si usás una **cuenta de servicio** en lugar de OAuth user credentials, tendrías que compartir con `nombre@proyecto.iam.gserviceaccount.com`. Para esta implementación usamos OAuth user credentials, así que solo asegurate de compartir con tu cuenta personal.

---

## 6. Obtener el ID de una carpeta

Cada carpeta en Drive tiene un ID único en su URL:

```
https://drive.google.com/drive/u/0/folders/1A2B3C4D5E6F7G8H9I0J
                                          └──────────┬──────────┘
                                          Este es el ID
```

Anotá el ID de cada carpeta que quieras usar como álbum.

---

## 7. Variables de entorno

En `.env.local` (desarrollo) **y** en Vercel (producción):

```bash
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
GOOGLE_REFRESH_TOKEN="1//0eXxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
GOOGLE_DRIVE_ROOT_FOLDER_ID="ID_de_tu_carpeta_raíz_opcional"
```

> `GOOGLE_DRIVE_ROOT_FOLDER_ID` es opcional y por ahora no se usa en la app. La asociación real se hace álbum por álbum desde el panel.

---

## 8. Probar

### Local
```bash
# Reiniciar el server después de cambiar .env.local
npm run dev
```

Entrá a `/admin/albumes/nuevo`, creá un álbum con el ID de una carpeta real y verificá que se sincronicen las fotos.

### Logs útiles
Si algo falla, abrí la consola del navegador en `/admin/albumes` y mirá los errores del endpoint `/api/albums/[id]/sync`. Los mensajes de error son explícitos (sin filtrar secretos).

---

## 9. Permisos de Google Drive — qué hace falta

| Permiso | Por qué |
|---------|---------|
| `https://www.googleapis.com/auth/drive.readonly` | Solo lectura. Suficiente para listar y descargar. **No pedimos write access.** |

**No necesitamos** permisos de escritura sobre Drive. La galería es estrictamente read-only sobre las carpetas del dojo.

---

## 10. Seguridad

- **Credenciales en el servidor**: las 4 variables viven solo en el entorno de Vercel y nunca se exponen al cliente.
- **OAuth scopes mínimos**: solo `drive.readonly`. Si Google pide re-autorización con scopes adicionales, revisá antes de aceptar.
- **Rotación de refresh token**: si comprometés el refresh token, podés revocarlo desde [myaccount.google.com/permissions](https://myaccount.google.com/permissions).
- **Carpeta compartida, no transferida**: la carpeta sigue siendo del dojo; la app solo la lee.

---

## 11. Costos

Google Drive API es **gratuita** para los volúmenes de uso de este sitio. Los límites son:

- 12.000.000 queries por día (más que suficiente)
- 1.000 queries por 100 segundos por usuario

Los thumbnails servidos por `lh3.googleusercontent.com` también son gratuitos.

---

## 12. Alternativa: cuenta de servicio

Si en el futuro el dojo quiere automatizar más (por ejemplo, crear carpetas automáticamente), podemos migrar a una **Service Account**. La configuración es similar pero requiere descargar una JSON key en lugar del OAuth flow.

---

## 13. Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| `invalid_grant` | Refresh token expirado o revocado | Repetir el paso 4. Si el problema persiste, eliminar y recrear el OAuth client. |
| `403 Forbidden` al listar | Carpeta no compartida con la cuenta autorizada | Compartir la carpeta con el email del paso 5. |
| `404 Not Found` | Folder ID incorrecto | Verificar que el ID coincida con la URL de Drive. |
| `400 Bad Request: invalid_scope` | Scopes mal configurados | Verificar que `GOOGLE_DRIVE_SCOPES=https://www.googleapis.com/auth/drive.readonly` (sin saltos de línea, sin caracteres extra). |
| Fotos no aparecen pero no hay error | Caché desactualizado | Hacer click en "Sincronizar" desde `/admin/albumes`. |
| Carpeta con miles de archivos | Timeout | El sync actual trae hasta 1000 fotos. Si necesitás más, ajustar `max` en `syncFolderCache`. |

---

## 14. Sincronización automática

Por ahora la sincronización es **manual** (botón en el panel de álbumes). Si querés sincronización automática cada N horas, podemos agregar:

1. Un endpoint `/api/cron/sync-all` que recorra todos los álbumes
2. Un cron job en Vercel (`vercel.json` → `crons`) que lo llame cada 6 horas, por ejemplo

Esto no es necesario para empezar — el sitio funciona perfectamente con sync manual.

---

## 15. Recursos

- [Google Drive API v3 reference](https://developers.google.com/drive/api/v3/reference)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
