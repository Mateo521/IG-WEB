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
└── web.php              → Ruta de bienvenida
```

### Modelos (base de datos)

| Modelo | Tabla | Relaciones |
|--------|-------|------------|
| `Rubro` | `rubros` | `hasMany(Subrubro)` |
| `Subrubro` | `subrubros` | `belongsTo(Rubro)`, `hasMany(Categoria)` |
| `Categoria` | `categorias` | `belongsTo(Subrubro)`, `hasMany(Producto)` |
| `Producto` | `productos` | `belongsTo(Categoria)`, `hasMany(Consulta)` |
| `Consulta` | `consultas` | `belongsTo(Producto)` |
| `User` | `users` | — |

**Jerarquía:** `Rubro → Subrubro → Categoria → Producto → Consulta`

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

## Incremento 2 — Autenticación + Frontend React

### Cambios en el backend

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
| `Categorias` | Admin | CRUD de categorías |
| `Productos` | Admin | Listado de productos con edición/eliminación |
| `ProductoForm` | Admin | Formulario crear/editar producto con subida de imagen |

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
GET  /api/rubros       →     Rubros.jsx + Subrubros.jsx (select)
GET  /api/subrubros    →     Subrubros.jsx + Categorias.jsx (select)
GET  /api/categorias   →     Categorias.jsx + ProductoForm.jsx (select)
POST/PUT/DELETE ...    →     CRUDs respectivos
```

### Estructura completa del proyecto

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

---

## Cómo levantar el proyecto completo

```bash
# Terminal 1 — Backend (Laravel)
php artisan serve                               # http://localhost:8000

# Terminal 2 — Frontend (React)
cd frontend && npm run dev                      # http://localhost:5173
```

Abrir `http://localhost:5173` para ver el catálogo público.
