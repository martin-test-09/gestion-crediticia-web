# Credit Web

Frontend Vite + React para **Gestión Crediticia**. Permite registrarse, verificar email, iniciar sesión y administrar presupuestos de crédito automotor con consulta BCRA.

## Quick path

1. Instalá dependencias: `pnpm install`.
2. Copiá `.env.example` a `.env`.
3. Configurá `VITE_API_URL=http://localhost:3000/api`.
4. Iniciá el frontend: `pnpm dev`.
5. Abrí `http://localhost:5173`.

> `VITE_API_URL` es obligatorio. La app no usa fallback silencioso para que una mala configuración de deploy sea visible.

## Demo flow

1. En el backend, ejecutá primero `pnpm seed -- --with-demo`.
2. Iniciá sesión con `test@test.com` / `Test1234`.
3. Verificá los flujos de **Presupuestos** y **Clientes** desde la navegación principal.

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo Vite |
| `pnpm build` | Build de producción |
| `pnpm preview` | Vista previa del build |

## Rutas

| Ruta | Uso |
|---|---|
| `/login` | Inicio de sesión |
| `/registro` | Registro de usuario |
| `/verificar-email` | Landing de verificación de email |
| `/clientes` | Administración de clientes activos |
| `/presupuestos` | Listado con filtros en vivo |
| `/presupuestos/nuevo` | Flujo de nuevo presupuesto |
| `/presupuestos/:id` | Detalle |
| `/presupuestos/:id/editar` | Edición financiera |

## Deploy

- En Vercel, configurar obligatoriamente `VITE_API_URL` con la URL pública del backend terminada en `/api`.
- `vercel.json` redirige deep links a `index.html`, necesario para `/verificar-email` y rutas protegidas.
- El backend debe tener `URL_FRONTEND` igual al origen exacto de Vercel.
