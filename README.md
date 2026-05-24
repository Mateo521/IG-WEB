# IG-WEB — Instrucciones para poner en funcionamiento

## Requisitos

- PHP >= 8.2
- Composer
- Node.js + npm
- SQLite (viene con PHP)

## Pasos

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd IG-WEB-main
```

### 2. Instalar dependencias

```bash
composer install
npm install
```

### 3. Configurar entorno

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Crear la base de datos SQLite

```bash
touch database/database.sqlite
```

### 5. Ejecutar migraciones (crea las tablas)

```bash
php artisan migrate
```

### 6. Poblar con datos de prueba

```bash
php artisan db:seed
```

Esto inserta:
- 3 Rubros
- 6 Subrubros
- 12 Categorías
- 24 Productos
- 6 Consultas

### 7. Crear enlace para imágenes

```bash
php artisan storage:link
```

### 8. Iniciar el servidor

```bash
# Terminal 1 — Backend (API)
php artisan serve
```

La API corre en `http://localhost:8000`.

### 9. Iniciar el frontend

En otra terminal:

```bash
# Terminal 2 — Frontend (React)
cd frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:5173` con proxy automático a la API.

**Nota:** El proyecto ahora tiene frontend y backend separados. El frontend (React) está en la carpeta `frontend/`, el backend (Laravel) en la raíz. El frontend usa Vite con proxy para redirigir `/api/*` y `/storage/*` al backend.

---

## Endpoints disponibles

| Método | URL | Descripción | Auth |
|--------|-----|-------------|------|
| POST | `/api/register` | Registrar nuevo usuario | No |
| POST | `/api/login` | Iniciar sesión (devuelve token) | No |
| POST | `/api/logout` | Cerrar sesión (revoca token) | Sí |
| GET | `/api/user` | Usuario autenticado | Sí |
| GET | `/api/rubros` | Listar rubros | No |
| POST | `/api/rubros` | Crear rubro | No |
| GET | `/api/rubros/{id}` | Ver rubro | No |
| PUT | `/api/rubros/{id}` | Actualizar rubro | No |
| DELETE | `/api/rubros/{id}` | Eliminar rubro | No |
| GET | `/api/subrubros` | Listar subrubros | No |
| POST | `/api/subrubros` | Crear subrubro | No |
| GET | `/api/subrubros/{id}` | Ver subrubro | No |
| PUT | `/api/subrubros/{id}` | Actualizar subrubro | No |
| DELETE | `/api/subrubros/{id}` | Eliminar subrubro | No |
| GET | `/api/categorias` | Listar categorías | No |
| POST | `/api/categorias` | Crear categoría | No |
| GET | `/api/categorias/{id}` | Ver categoría | No |
| PUT | `/api/categorias/{id}` | Actualizar categoría | No |
| DELETE | `/api/categorias/{id}` | Eliminar categoría | No |
| GET | `/api/productos` | Listar productos | No |
| POST | `/api/productos` | Crear producto (con imagen) | No |
| GET | `/api/productos/{id}` | Ver producto | No |
| PUT | `/api/productos/{id}` | Actualizar producto | No |
| DELETE | `/api/productos/{id}` | Eliminar producto | No |
| GET | `/api/consultas` | Listar consultas | No |
| POST | `/api/consultas` | Crear consulta | No |

---

## Estructura entregada

```
IG-WEB/
├── app/
│   ├── Http/
│   │   ├── Controllers/       → Controladores de la API (incluye AuthController)
│   │   └── Requests/          → Validación de producto
│   ├── Models/                → Modelos Eloquent
├── frontend/
│   ├── src/
│   │   ├── components/        → Navbar, Layout, ProtectedRoute
│   │   ├── pages/             → Login, Register, Dashboard, CRUDs, Catálogo público
│   │   ├── services/          → api.js (Axios con interceptor de token)
│   │   ├── App.jsx            → Router principal
│   │   └── main.jsx           → Entry point React
│   ├── index.html
│   └── vite.config.js         → Proxy a localhost:8000
├── database/
│   ├── migrations/            → Estructura de tablas
│   ├── seeders/               → Datos de prueba
├── routes/
│   ├── api.php                → Rutas de la API
│   └── web.php                → Ruta de bienvenida
```

## Arquitectura del proyecto

### Backend — Modelos (base de datos)

| Modelo | Tabla | Relaciones |
|--------|-------|------------|
| `Rubro` | `rubros` | `hasMany(Subrubro)` |
| `Subrubro` | `subrubros` | `belongsTo(Rubro)`, `hasMany(Categoria)` |
| `Categoria` | `categorias` | `belongsTo(Subrubro)`, `hasMany(Producto)` |
| `Producto` | `productos` | `belongsTo(Categoria)`, `hasMany(Consulta)` |
| `Consulta` | `consultas` | `belongsTo(Producto)` |
| `User` | `users` | — |

**Jerarquía:** `Rubro → Subrubro → Categoria → Producto → Consulta`

### Backend — Controladores (API)

| Controlador | Rutas | Auth |
|-------------|-------|------|
| `AuthController` | `POST /api/register`, `POST /api/login`, `POST /api/logout` | Sólo logout requiere token |
| `RubroController` | CRUD `/api/rubros` | Público |
| `SubrubroController` | CRUD `/api/subrubros` | Público |
| `CategoriaController` | CRUD `/api/categorias` | Público |
| `ProductoController` | CRUD `/api/productos` | Público |
| `ConsultaController` | CRUD `/api/consultas` | Público |

### Frontend — Layouts y navegación

| Componente | Acceso | Función |
|------------|--------|---------|
| `LayoutPublico` | Público | Envuelve páginas públicas con `NavbarPublico` |
| `Layout` | Privado (admin) | Envuelve páginas de admin con `Navbar` |
| `NavbarPublico` | Público | Logo + botón "Iniciar Sesión" |
| `Navbar` | Privado (admin) | Logo, links a CRUDs, nombre de usuario + "Salir" |
| `ProtectedRoute` | — | Redirige a `/login` si no hay token |

### Frontend — Páginas públicas

| Página | Ruta | Qué hace |
|--------|------|----------|
| `Catalogo` | `/` | Grid público de todos los productos con imagen, nombre, precio y categoría |
| `Login` | `/login` | Formulario email+password. Llama a `POST /api/login`, guarda token y redirige a `/admin/dashboard` |
| `Register` | `/register` | Formulario de registro. Llama a `POST /api/register`, misma lógica que Login |

### Frontend — Páginas privadas (admin)

| Página | Ruta | Qué hace |
|--------|------|----------|
| `Dashboard` | `/admin/dashboard` | Panel con cards de acceso rápido a CRUDs + sección "PRÓXIMAMENTE CONSULTAS" |
| `Rubros` | `/admin/rubros` | Tabla de rubros + formulario para crear/editar |
| `Subrubros` | `/admin/subrubros` | Tabla de subrubros + selector de rubro padre |
| `Categorias` | `/admin/categorias` | Tabla de categorías + selector de subrubro padre |
| `Productos` | `/admin/productos` | Tabla de productos con imágenes y jerarquía completa (rubro → subrubro → categoría) |
| `ProductoForm` | `/admin/productos/nuevo` y `/admin/productos/:id/editar` | Formulario completo con nombre, descripción, precio, categoría e imagen |

### Frontend — Servicios

| Archivo | Función |
|---------|---------|
| `api.js` | Instancia de Axios con `baseURL: /api`. Agrega `Authorization: Bearer <token>` de localStorage. Si hay error 401, limpia token y redirige a `/login` |

### Mapeo API → Frontend

```
API                           Frontend
POST /api/login        →     Login.jsx (guarda token en localStorage)
POST /api/register     →     Register.jsx (guarda token en localStorage)
POST /api/logout       →     Navbar.jsx (botón "Salir")
GET  /api/productos    →     Catalogo.jsx (público) + Productos.jsx (admin)
GET  /api/rubros       →     Rubros.jsx + Subrubros.jsx (select de rubro padre)
GET  /api/subrubros    →     Subrubros.jsx + Categorias.jsx (select de subrubro padre)
GET  /api/categorias   →     Categorias.jsx + ProductoForm.jsx (select de categoría)
POST/PUT/DELETE ...    →     CRUDs respectivos
```

---

## Incrementos

### Incremento 2 — Autenticación + Frontend React

**Cambios en el backend:**

- Creado `AuthController` con `register`, `login` y `logout`
- Agregado trait `HasApiTokens` al modelo `User`
- Agregadas rutas de autenticación en `routes/api.php`
- Mejorada validación en `ProductoController@update`

**Nuevos endpoints de API:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/register` | Registro (name, email, password, password_confirmation) |
| POST | `/api/login` | Login (email, password) → devuelve `{ user, token }` |
| POST | `/api/logout` | Revoca el token actual (requiere auth) |

**Frontend React + Vite:**

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

| Componente | Descripción |
|------------|-------------|
| `Catalogo` | Grid público de productos |
| `NavbarPublico` | Navbar con logo + botón "Iniciar Sesión" |
| `LayoutPublico` | Layout del sitio público |
| `Navbar` | Navbar de admin con links a CRUDs + logout |
| `Layout` | Layout del panel de admin |
| `ProtectedRoute` | Redirige a `/login` si no hay token |
| `Login` | Formulario de inicio de sesión |
| `Register` | Formulario de registro |
| `Dashboard` | Panel con cards de acceso rápido |
| `Rubros` | CRUD de rubros |
| `Subrubros` | CRUD de subrubros |
| `Categorias` | CRUD de categorías |
| `Productos` | Listado de productos con edición/eliminación |
| `ProductoForm` | Formulario crear/editar producto con subida de imagen |

**Flujo de autenticación:**
1. El frontend envía `POST /api/login` con email y password
2. El backend devuelve `{ user, token }` (token de Sanctum)
3. El frontend guarda el token y lo envía en cada request como `Authorization: Bearer <token>`

**Cómo levantar el proyecto completo:**

```bash
# Terminal 1 — Backend
php artisan serve                          # localhost:8000

# Terminal 2 — Frontend
cd frontend && npm run dev                 # localhost:5173
```

Abrir `http://localhost:5173` para ver el catálogo público.
