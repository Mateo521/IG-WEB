# IG-WEB

---

## Incremento 1 — API Laravel

**Backend REST API** para catálogo jerárquico de productos con gestión de consultas.

### Requisitos

- PHP >= 8.2
- Composer
- SQLite (viene con PHP)

### Pasos de instalación

```bash
# 1. Clonar e instalar dependencias
git clone <url-del-repo>
cd IG-WEB
composer install

# 2. Configurar entorno
cp .env.example .env
php artisan key:generate

# 3. Crear base de datos SQLite
touch database/database.sqlite

# 4. Migraciones y seeders
php artisan migrate
php artisan db:seed

# 5. Enlace para imágenes
php artisan storage:link

# 6. (Requerido desde Inc. 2) Compresión de imágenes
composer require intervention/image-laravel

# 7. Refrescar BD con seeders (incluye pivots M:N)
php artisan migrate:fresh --seed
```

Esto inserta:
- 3 Rubros
- 6 Subrubros
- 12 Categorías
- 24 Productos
- 6 Consultas

### Estructura del backend

```
app/
├── Http/
│   ├── Controllers/    → Controladores de la API
│   └── Requests/       → Validación de producto
├── Models/              → Modelos Eloquent
database/
├── migrations/          → Estructura de tablas
├── seeders/             → Datos de prueba
routes/
├── api.php              → Rutas de la API
└── web.php              → Ruta catch-all para el SPA
```

### Modelos (base de datos)

| Modelo | Tabla | Relaciones (desde Incremento 2) |
|--------|-------|----------------------------------|
| `Rubro` | `rubros` | `hasMany(Subrubro)`, `hasMany(Producto)` |
| `Subrubro` | `subrubros` | `belongsTo(Rubro)`, `belongsToMany(Categoria)` |
| `Categoria` | `categorias` | `belongsToMany(Subrubro)`, `belongsToMany(Producto)` |
| `Producto` | `productos` | `belongsTo(Rubro)`, `belongsTo(Subrubro)`, `belongsToMany(Categoria)`, `hasMany(Consulta)` |
| `Consulta` | `consultas` | `belongsTo(Producto)` |
| `User` | `users` | — |

**Jerarquía:** `Rubro → Subrubro → Categoria` (M:N entre Subrubro y Categoria, M:N entre Producto y Categoria)

> **Nota:** En Incremento 1 las relaciones eran todas 1:N (`Categoria → Subrubro` y `Producto → Categoria`). En Incremento 2 se migró a M:N para mayor flexibilidad. Ver sección "Fundamentos del rediseño" en Incremento 2.

### Controladores (API)

| Controlador | Rutas |
|-------------|-------|
| `RubroController` | CRUD `/api/rubros` |
| `SubrubroController` | CRUD `/api/subrubros` |
| `CategoriaController` | CRUD `/api/categorias` |
| `ProductoController` | CRUD `/api/productos` (con imágenes) |
| `ConsultaController` | CRUD `/api/consultas` |

### Endpoints disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/rubros` | Listar rubros |
| POST | `/api/rubros` | Crear rubro |
| GET | `/api/rubros/{id}` | Ver rubro |
| PUT | `/api/rubros/{id}` | Actualizar rubro |
| DELETE | `/api/rubros/{id}` | Eliminar rubro |
| GET | `/api/subrubros` | Listar subrubros |
| POST | `/api/subrubros` | Crear subrubro |
| GET | `/api/subrubros/{id}` | Ver subrubro |
| PUT | `/api/subrubros/{id}` | Actualizar subrubro |
| DELETE | `/api/subrubros/{id}` | Eliminar subrubro |
| GET | `/api/categorias` | Listar categorías |
| POST | `/api/categorias` | Crear categoría |
| GET | `/api/categorias/{id}` | Ver categoría |
| PUT | `/api/categorias/{id}` | Actualizar categoría |
| DELETE | `/api/categorias/{id}` | Eliminar categoría |
| GET | `/api/productos` | Listar productos |
| POST | `/api/productos` | Crear producto (con imagen) |
| GET | `/api/productos/{id}` | Ver producto |
| PUT | `/api/productos/{id}` | Actualizar producto |
| DELETE | `/api/productos/{id}` | Eliminar producto |
| GET | `/api/consultas` | Listar consultas |
| POST | `/api/consultas` | Crear consulta |

---

## Incremento 2 — Autenticación + Frontend React + Rediseño de Esquema

### Cambios en el backend (auth)

- Creado `AuthController` con `register`, `login` y `logout`
- Agregado trait `HasApiTokens` al modelo `User`
- Agregadas rutas de autenticación en `routes/api.php`
- Mejorada validación en `ProductoController@update`

**Nuevos endpoints de API:**

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/register` | Registro (name, email, password, password_confirmation) | No |
| POST | `/api/login` | Login (email, password) → devuelve `{ user, token }` | No |
| POST | `/api/logout` | Revoca el token actual | Sí |
| GET | `/api/user` | Usuario autenticado | Sí |

### Fundamentos del rediseño

**Problema original:** La jerarquía `Rubro → Subrubro → Categoria → Producto` usaba relaciones 1:N rígidas:
- Una `Categoría` solo podía pertenecer a un `Subrubro`
- Un `Producto` solo podía tener una `Categoría`

Esto limitaba casos reales (ej. una categoría "Accesorios" compartida por múltiples subrubros, o un producto que abarca varias categorías).

**Solución:** Migrar a relaciones Many-to-Many:
- `Categoria ↔ Subrubro`: Una categoría puede estar en varios subrubros (pivot `categoria_subrubro`)
- `Producto ↔ Categoria`: Un producto puede tener varias categorías (pivot `categoria_producto`)
- `Producto` ahora referencia directamente `rubro_id` y `subrubro_id` como claves foráneas

**¿Por qué se mantienen rubro_id y subrubro_id directos en Producto?** Para preservar la cascada de selección en el formulario (Rubro → Subrubro → Categorías) sin joins adicionales, y porque un producto siempre tiene exactamente un rubro y un subrubro.

### Cambios en el backend

#### Nuevas migraciones

| Migración | Descripción |
|-----------|-------------|
| `2026_05_24_000001_create_categoria_subrubro_table` | Pivot M:N entre categorías y subrubros |
| `2026_05_24_000002_create_categoria_producto_table` | Pivot M:N entre productos y categorías |
| `2026_05_24_000003_modify_categorias_table` | Elimina `subrubro_id` de `categorias` |
| `2026_05_24_000004_modify_productos_table` | Agrega `rubro_id`, `subrubro_id`; elimina `categoria_id` de `productos` |

#### Modelos actualizados

| Modelo | Relaciones nuevas/cambiadas |
|--------|----------------------------|
| `Rubro` | + `hasMany(Producto)` |
| `Subrubro` | `hasMany(Categoria)` → `belongsToMany(Categoria)` |
| `Categoria` | `belongsTo(Subrubro)` → `belongsToMany(Subrubro)`; `hasMany(Producto)` → `belongsToMany(Producto)` |
| `Producto` | `belongsTo(Categoria)` → `belongsToMany(Categoria)`; + `belongsTo(Rubro)`, + `belongsTo(Subrubro)` |

**Nuevo esquema de tablas:**

```
rubros
  ├── subrubros (FK rubro_id)
  │     └── categoria_subrubro (pivot)
  │           └── categorias
  │                 └── categoria_producto (pivot)
  │                       └── productos (FK rubro_id, subrubro_id)
  └── productos (FK rubro_id)
```

#### Controladores actualizados

**`ProductoController`:**
- `index/show` ahora carga eager: `rubro`, `subrubro`, `categorias`
- `store/update` acepta `rubro_id`, `subrubro_id`, `categorias[]` (array de IDs)
- Sincroniza pivot `categoria_producto` con `attach()`/`sync()`
- Compresión de imagen con Intervention Image (si está instalado): `scaleDown(800px)` + calidad 75%

**`CategoriaController`:**
- `store` acepta `subrubros[]` (array de IDs) en lugar de `subrubro_id`
- `update` sincera pivot `categoria_subrubro` con `sync()`
- Soporta filtro por `subrubro_id` vía `?subrubro_id=X` en `index`

**`AlmacenarProductoRequest`:**
- Reemplaza `categoria_id` por `rubro_id`, `subrubro_id`, `categorias[]`

#### Image compression

Se instaló `intervention/image-laravel` para comprimir imágenes subidas:
- La imagen se escala a 800px de ancho (manteniendo aspect ratio)
- Se guarda con calidad 75%
- Si el paquete no está instalado, la imagen se sube sin compresión (fallback seguro)

Para instalar:
```bash
composer require intervention/image-laravel
```

### Frontend React + Vite

- Creado proyecto React + Vite en `frontend/` (separado del backend)
- Catálogo público de productos en la raíz (`/`) visible sin autenticación
- Admin protegido bajo `/admin/*` con login, registro y CRUD completo
- Navbar público con acceso a login y navbar de admin con links a gestión
- Proxy de Vite configurado para comunicarse con el backend en `localhost:8000`

**Rutas del frontend:**

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Catálogo de productos con imágenes, precio y categoría |
| `/login` | Público | Inicio de sesión de administrador |
| `/register` | Público | Registro de administrador |
| `/admin/dashboard` | Requiere auth | Panel principal con acceso rápido a gestión |
| `/admin/rubros` | Requiere auth | CRUD de rubros |
| `/admin/subrubros` | Requiere auth | CRUD de subrubros |
| `/admin/categorias` | Requiere auth | CRUD de categorías |
| `/admin/productos` | Requiere auth | Listado de productos |
| `/admin/productos/nuevo` | Requiere auth | Crear producto con imagen |
| `/admin/productos/{id}/editar` | Requiere auth | Editar producto |

**Componentes React creados:**

| Componente | Acceso | Función |
|------------|--------|---------|
| `NavbarPublico` | Público | Navbar con logo + botón "Iniciar Sesión" |
| `LayoutPublico` | Público | Layout del sitio público |
| `Catalogo` | Público | Grid público de productos |
| `Login` | Público | Formulario de inicio de sesión |
| `Register` | Público | Formulario de registro |
| `ProtectedRoute` | — | Redirige a `/login` si no hay token |
| `Navbar` | Admin | Navbar con links a CRUDs + logout |
| `Layout` | Admin | Layout del panel de admin |
| `Dashboard` | Admin | Panel con cards de acceso rápido + "PRÓXIMAMENTE CONSULTAS" |
| `Rubros` | Admin | CRUD de rubros |
| `Subrubros` | Admin | CRUD de subrubros |
| `Categorias` | Admin | CRUD de categorías (con multi-select de subrubros) |
| `Productos` | Admin | Listado de productos con edición/eliminación |
| `ProductoForm` | Admin | Formulario crear/editar producto con cascading selects y subida de imagen |

**Servicios:**

| Archivo | Función |
|---------|---------|
| `api.js` | Axios con `baseURL: /api`. Agrega token Bearer desde localStorage. Si hay error 401, limpia token y redirige a `/login` |

**Flujo de autenticación:**
1. El frontend envía `POST /api/login` con email y password
2. El backend devuelve `{ user, token }` (token de Sanctum)
3. El frontend guarda el token en localStorage y lo envía en cada request como `Authorization: Bearer <token>`

**Mapeo API → Frontend:**

```
API                           Frontend
POST /api/login        →     Login.jsx (guarda token)
POST /api/register     →     Register.jsx (guarda token)
POST /api/logout       →     Navbar.jsx (botón "Salir")
GET  /api/productos    →     Catalogo.jsx (público) + Productos.jsx (admin)
GET  /api/rubros       →     Rubros.jsx + Subrubros.jsx + ProductoForm.jsx (select)
GET  /api/subrubros    →     Subrubros.jsx + Categorias.jsx + ProductoForm.jsx (select)
GET  /api/categorias   →     Categorias.jsx + ProductoForm.jsx (checkboxes)
POST/PUT/DELETE ...    →     CRUDs respectivos
```

### Cambios en componentes por el rediseño

#### ProductoForm — Cascading selects

El formulario de producto ahora tiene un selector en cascada:

1. **Rubro** (select) → filtra los subrubros disponibles
2. **Subrubro** (select, se desbloquea al elegir rubro) → filtra las categorías disponibles (vía pivot)
3. **Categorías** (checkboxes, aparecen al elegir subrubro) → selección múltiple

En edición, se precargan los valores existentes (rubro, subrubro, categorías marcadas).

#### Categorias — Multi-subrubro

El formulario de categorías ahora usa checkboxes para seleccionar múltiples subrubros (antes era un select único). La tabla muestra los subrubros separados por coma.

#### Productos.jsx

Las columnas ahora usan las nuevas relaciones:
- Rubro: `p.rubro?.nombreRubro`
- Subrubro: `p.subrubro?.nombreSubrubro`
- Categoría: `p.categorías?.map(c => c.nombreCategoria).join(', ')`

#### Catalogo.jsx

Muestra la lista de categorías separada por comas en lugar de una categoría única.

### Seeders actualizados

- `CategoriaSeeder`: cada categoría se crea sin FK directo y se asocia a subrubros vía pivot `categoria_subrubro` (la última categoría se asocia a 2 subrubros para demostrar M:N)
- `ProductoSeeder`: cada producto recibe `rubro_id`, `subrubro_id` y se asocia a una categoría vía pivot `categoria_producto`

### Comandos para aplicar los cambios

```bash
# 1. Instalar nuevas dependencias
composer require intervention/image-laravel

# 2. Refrescar base de datos con nuevo esquema + seeders
php artisan migrate:fresh --seed

# 3. Crear enlace para imágenes (si no existe)
php artisan storage:link
```

---

## Incremento 3 — Unificación de builds (Laravel + React)

### Problema que resolvía

Hasta el Incremento 2, el proyecto requería **dos procesos separados** para correr:

- `php artisan serve` → backend Laravel en `localhost:8000`
- `cd frontend && npm run dev` → frontend React en `localhost:5173`

Esto implicaba también mantener **dos `package.json` y dos `vite.config.js`** independientes (uno en la raíz para Laravel/Blade y otro en `frontend/` para React), lo que generaba confusión y duplicación de dependencias.

### Cambios realizados

#### Eliminación de `frontend/`

La carpeta `frontend/` fue eliminada por completo. Su contenido (`src/`) fue movido a `resources/js/`, que es la ubicación estándar de assets en Laravel.

#### `vite.config.js` (raíz) — reemplazado

**Antes** (config de Blade/Tailwind, sin React):
```js
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({ input: ['resources/css/app.css', 'resources/js/app.js'] }),
        tailwindcss(),
    ],
});
```

**Después** (config unificada con React):
```js
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
    plugins: [
        laravel({ input: ['resources/js/main.jsx'], refresh: true }),
        react(),
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:8000',
            '/storage': 'http://localhost:8000',
        },
    },
});
```

#### `package.json` (raíz) — unificado

Se fusionaron las dependencias de `frontend/package.json` en el `package.json` raíz. Se agregó `concurrently` para levantar ambos servidores con un solo comando:

```json
"scripts": {
    "dev": "concurrently -n \"Laravel,Vite\" -c \"blue,green\" \"php artisan serve\" \"vite\"",
    "build": "vite build"
}
```

#### `resources/views/welcome.blade.php` — reemplazado

La vista de bienvenida de Laravel fue reemplazada por un shell HTML mínimo que carga el SPA React:

```blade
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>IG-WEB</title>
        @viteReactRefresh
        @vite(['resources/js/main.jsx'])
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```

> `@viteReactRefresh` es necesario para que el plugin de React pueda inyectar el preamble de Fast Refresh en modo desarrollo.

#### `routes/web.php` — catch-all para el SPA

Se reemplazó la ruta única `/` por una ruta catch-all que sirve siempre la vista `welcome`, permitiendo que React Router maneje la navegación del lado del cliente:

```php
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
```

### Estructura del proyecto (actualizada)

```
IG-WEB/
├── app/
│   ├── Http/
│   │   ├── Controllers/       → Controladores de la API (incluye AuthController)
│   │   └── Requests/          → Validación de producto
│   └── Models/                → Modelos Eloquent
├── resources/
│   └── js/                    → Todo el código React (antes en frontend/src/)
│       ├── components/        → Navbar, Layout, ProtectedRoute
│       ├── pages/             → Login, Register, Dashboard, CRUDs, Catálogo público
│       ├── services/          → api.js (Axios con interceptor de token)
│       ├── App.jsx            → Router principal
│       ├── main.jsx           → Entry point React
│       └── index.css          → Estilos globales
├── resources/views/
│   └── welcome.blade.php      → Shell HTML que carga el SPA
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php                → Rutas de la API
│   └── web.php                → Catch-all para el SPA
├── vite.config.js             → Config unificada (Laravel + React)
└── package.json               → Dependencias unificadas
```

### Cómo levantar el proyecto

```bash
# Instalar dependencias PHP
composer install

# Instalar dependencias JS
npm install

# Levantar todo con un solo comando
npm run dev
```

Abrir `http://localhost:8000` para ver la aplicación.

> `localhost:5173` es el servidor de assets de Vite — no sirve la app directamente. La URL correcta siempre es `localhost:8000`.

### Build de producción

```bash
npm run build
php artisan serve
```

Vite compila los assets en `public/build/` y Laravel los sirve automáticamente.

---

### Filtros y búsqueda en el Catálogo público

#### ¿Qué se agregó?

El catálogo público (`/`) pasó de mostrar todos los productos sin ningún control a tener un sistema completo de filtrado y paginación server-side.

#### Backend — `ProductoController@index`

El método `index()` ahora acepta los siguientes query params opcionales:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `search` | string | Busca en `nombreProducto` y `descripcion` (LIKE) |
| `rubro_id` | integer | Filtra por rubro |
| `subrubro_id` | integer | Filtra por subrubro |
| `categoria_id` | integer | Filtra por categoría (busca en el pivot M:N) |
| `precio_min` | numeric | Precio mayor o igual a este valor |
| `precio_max` | numeric | Precio menor o igual a este valor |
| `sort` | string | `reciente` (default), `precio_asc`, `precio_desc`, `nombre_asc` |
| `por_pagina` | integer | Resultados por página (1–50, default 12) |
| `paginate` | string | `false` para devolver todos sin paginar (uso interno del admin) |

**Respuesta paginada** (cuando `paginate` ≠ `false`):
```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 3,
  "total": 24,
  "per_page": 12
}
```

El flag `?paginate=false` permite que la tabla del admin (`/admin/productos`) siga recibiendo un array plano sin romper su lógica existente.

#### Frontend — nuevos componentes

| Componente | Ubicación | Función |
|---|---|---|
| `SidebarFiltros` | `components/SidebarFiltros/` | Panel lateral con selects en cascada (Rubro → Subrubro → Categoría), rango de precio y ordenamiento |
| `Paginacion` | `components/Paginacion/` | Botones numerados `‹ 1 2 3 … N ›` con separadores inteligentes |
| `ProductoCardSkeleton` | `components/ProductoCardSkeleton/` | Tarjetas placeholder animadas (shimmer) mientras cargan los datos |

#### Frontend — `Catalogo.jsx` (reescrito)

- **Estado de filtros**: objeto `filtros` con todos los parámetros, estado `pagina` para la página actual.
- **Debounce**: las peticiones al servidor se retrasan 350ms para no saturar la API mientras el usuario escribe.
- **Cascada**: elegir un Rubro limpia el Subrubro seleccionado; elegir un Subrubro limpia la Categoría.
- **Chips de filtros activos**: fila de etiquetas sobre la grilla que muestra qué está aplicado. Cada chip tiene un `×` para quitarlo individualmente.
- **Contador de resultados**: el subtítulo muestra "N productos encontrados" o "Buscando…" según el estado.
- **Responsive**: en pantallas menores a 768px el sidebar se apila sobre la grilla.
- **Toggle grilla/lista**: botón de dos estados en el encabezado del catálogo. La preferencia se guarda en `localStorage` para que se recuerde entre visitas. En modo lista cada tarjeta muestra imagen a la izquierda y descripción completa (3 líneas) a la derecha.

---

### Dashboard con métricas reales

#### ¿Qué se agregó?

El dashboard dejó de ser una página estática con links fijos. Ahora muestra contadores reales de cada entidad y la tarjeta de "PRÓXIMAMENTE CONSULTAS" fue reemplazada por una tarjeta funcional de Consultas.

#### Backend — `DashboardController`

Nuevo controlador en `app/Http/Controllers/DashboardController.php`.

**Endpoint:**

| Método | URL | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/stats` | No | Devuelve el conteo de cada entidad |

**Respuesta:**
```json
{
  "rubros":     3,
  "subrubros":  6,
  "categorias": 12,
  "productos":  24,
  "consultas":  6
}
```

Usa `Model::count()` directo sobre cada tabla, sin joins ni relaciones. Es la forma más eficiente para un simple conteo.

#### Frontend — `Dashboard.jsx` (reescrito)

- Llama a `GET /api/stats` al montar el componente.
- Mientras espera la respuesta muestra un skeleton animado (parpadeo) en el lugar del número.
- Si la petición falla muestra `—` en lugar de un número para no ocultar el error al usuario.
- Las 5 tarjetas (Rubros, Subrubros, Categorías, Productos, Consultas) muestran el contador en grande arriba del título.
- Cada tarjeta es un `<Link>` que navega a la sección correspondiente del admin.
- La configuración de las tarjetas está en el array `TARJETAS` fuera del componente, lo que facilita agregar o quitar tarjetas sin tocar el JSX.

---

### Importar y exportar productos en CSV

#### ¿Qué se agregó?

Desde la tabla de admin `/admin/productos` el administrador puede importar productos en lote subiendo un CSV, exportar los productos actuales a CSV y descargar una plantilla de ejemplo.

#### Backend — nuevas rutas y métodos

Las rutas se declaran **antes** del `apiResource` en `routes/api.php` para que Laravel no confunda los segmentos `importar` y `exportar` con un ID de producto en la ruta `/{producto}`.

| Método | URL | Descripción |
|---|---|---|
| `POST` | `/api/productos/importar` | Recibe archivo CSV, crea productos fila por fila |
| `GET` | `/api/productos/exportar` | Descarga un CSV con los productos (acepta los mismos filtros que `index`) |

**`exportar()`** — reutiliza `queryFiltrada()` (mismo método privado que usa `index()`), por lo que exporta exactamente los mismos productos que se verían con esos filtros. Escribe el CSV directamente al stream de salida con `fputcsv()` y agrega BOM UTF-8 para compatibilidad con Excel.

Columnas del CSV exportado: `id, nombreProducto, descripcion, precio, rubro_id, rubro, subrubro_id, subrubro, categorias_ids, categorias_nombres`. Las categorías se separan con `|` para no romper el formato CSV.

**`importar()`** — lee el archivo con `fgetcsv()` fila por fila. Formato esperado:

```
nombreProducto,descripcion,precio,rubro_id,subrubro_id,categorias
"Producto","Descripcion",1500.00,1,2,3|4
```

- La primera fila (cabecera) se ignora.
- Los IDs de categorías son opcionales y van separados por `|`.
- Los IDs de rubro y subrubro se validan contra la BD (pre-cargados en memoria para evitar N+1 queries).
- Si una fila falla se registra el error y se continúa con la siguiente sin abortar el proceso.
- Respuesta: `{ mensaje, creados: N, errores: [{ fila: N, motivo: "..." }] }`

Se extrajo la lógica de filtros de `index()` al método privado `queryFiltrada()` para que tanto `index()` como `exportar()` usen exactamente el mismo código.

#### Frontend — `Productos.jsx`

Se agregaron tres botones en el header de la tabla:

| Botón | Acción |
|---|---|
| **Plantilla CSV** | Genera y descarga un CSV de ejemplo en el navegador (sin llamar al servidor) |
| **Importar CSV** | Abre el selector de archivos; al elegir un `.csv` lo sube y muestra el resultado |
| **Exportar CSV** | Llama a `GET /api/productos/exportar` con Axios (`responseType: blob`) y dispara la descarga |

El resultado de la importación se muestra en un panel debajo del header (en verde si todo fue bien, en rojo si hubo errores) con la lista de errores por número de fila. El panel tiene un `×` para cerrarlo.
