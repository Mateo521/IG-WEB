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
└── web.php              → Ruta de bienvenida
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

### Cambios en el frontend

#### ProductoForm — Cascading selects

El formulario de producto ahora tiene un selector en cascada:

1. **Rubro** (select) → carga los subrubros de ese rubro
2. **Subrubro** (select, se desbloquea al elegir rubro) → carga las categorías de ese subrubro (filtrando por pivot)
3. **Categorías** (checkboxes, aparecen al elegir subrubro) → selección múltiple

En edición, se precargan los valores existentes (rubro, subrubro, categorías marcadas).

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
composer update

# 2. Refrescar base de datos con nuevo esquema + seeders
php artisan migrate:fresh --seed

# 3. Crear enlace para imágenes (si no existe)
php artisan storage:link

# 4. (Opcional) Publicar config de Intervention Image
php artisan vendor:publish --provider="Intervention\Image\Laravel\ServiceProvider"
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
