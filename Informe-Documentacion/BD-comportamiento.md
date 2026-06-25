# Base de Datos — IG-WEB

## Diagrama de Relaciones

```
                  ┌───────────┐
                  │  Rubros   │
                  └─────┬─────┘
                        │ 1
                        │
                  ┌─────┴───────┐
           ┌──────┤  Subrubros  │
           │      └──┬──────────┘
           │         │
           │         │ N:M
           │         │
     ┌─────┴─────┐   │   ┌──────────────────┐
     │ Categorías│◄──┘   │ categoria_subrubro│
     └─────┬─────┘       │ (PIVOT)           │
           │             └──────────────────┘
           │ N:M
           │
     ┌─────┴─────────────────────────────────────────┐
     │                  Productos                    │
     │  (rubro_id) ────────────────── Rubros         │
     │  (subrubro_id) ────────────── Subrubros      │
     │  (categorias via pivot) ───── Categorias     │
     └─────┬─────────────────────────────────────────┘
           │ 1
           │
     ┌─────┴───────┐
     │  Consultas  │
     └─────────────┘

┌───────────────────────────┐
│         Users             │
│  (is_admin, is_approved)  │
└───────────┬───────────────┘
            │ 1:N (polimórfico)
            │
┌───────────┴───────────────────┐
│  personal_access_tokens       │
│  (Sanctum - tokenable)        │
└───────────────────────────────┘
```

---

## Tablas (Esquema Final)

### `users`
| Columna | Tipo | Default | Descripción |
|---|---|---|---|
| id | BIGINT PK | auto | ID único |
| name | VARCHAR(255) | — | Nombre del usuario |
| email | VARCHAR(255) | — | Email único |
| email_verified_at | TIMESTAMP | null | Fecha de verificación |
| password | VARCHAR(255) | — | Contraseña hasheada (bcrypt) |
| is_admin | BOOLEAN | false | Es administrador |
| is_approved | BOOLEAN | false | Aprobado por un admin |
| remember_token | VARCHAR(100) | null | Token "recordarme" |
| created_at | TIMESTAMP | — | Fecha de creación |
| updated_at | TIMESTAMP | — | Fecha de actualización |

### `rubros`
| Columna | Tipo | Default | Descripción |
|---|---|---|---|
| id | BIGINT PK | auto | ID único |
| nombreRubro | VARCHAR(255) | — | Nombre del rubro |
| created_at | TIMESTAMP | — | Fecha de creación |
| updated_at | TIMESTAMP | — | Fecha de actualización |

### `subrubros`
| Columna | Tipo | Default | Descripción |
|---|---|---|---|
| id | BIGINT PK | auto | ID único |
| nombreSubrubro | VARCHAR(255) | — | Nombre del subrubro |
| rubro_id | BIGINT FK | — | Rubro padre (FK → rubros.id) |
| created_at | TIMESTAMP | — | Fecha de creación |
| updated_at | TIMESTAMP | — | Fecha de actualización |

### `categorias`
| Columna | Tipo | Default | Descripción |
|---|---|---|---|
| id | BIGINT PK | auto | ID único |
| nombreCategoria | VARCHAR(255) | — | Nombre de la categoría |
| created_at | TIMESTAMP | — | Fecha de creación |
| updated_at | TIMESTAMP | — | Fecha de actualización |

> Nota: Originalmente tenía `subrubro_id` como FK directa, luego migrada a relación N:M.

### `productos`
| Columna | Tipo | Default | Descripción |
|---|---|---|---|
| id | BIGINT PK | auto | ID único |
| nombreProducto | VARCHAR(255) | — | Nombre del producto |
| descripcion | TEXT | — | Descripción del producto |
| precio | DECIMAL(10,2) | — | Precio |
| rutaImg | VARCHAR(255) | null | Ruta de la imagen |
| rubro_id | BIGINT FK | — | Rubro al que pertenece (FK → rubros.id) |
| subrubro_id | BIGINT FK | — | Subrubro al que pertenece (FK → subrubros.id) |
| created_at | TIMESTAMP | — | Fecha de creación |
| updated_at | TIMESTAMP | — | Fecha de actualización |

> Nota: Originalmente tenía `categoria_id` como FK directa, luego migrada a relación N:M.

### `consultas`
| Columna | Tipo | Default | Descripción |
|---|---|---|---|
| id | BIGINT PK | auto | ID único |
| nombreConsulta | VARCHAR(255) | — | Nombre de quien consulta |
| email | VARCHAR(255) | — | Email de contacto |
| mensaje | TEXT | — | Contenido de la consulta |
| visto | BOOLEAN | false | Marcada como leída por el admin |
| producto_id | BIGINT FK | — | Producto sobre el que se consulta (FK → productos.id) |
| created_at | TIMESTAMP | — | Fecha de creación |
| updated_at | TIMESTAMP | — | Fecha de actualización |

---

## Tablas Pivot (Relaciones N:M)

### `categoria_subrubro`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | BIGINT PK | auto | ID único |
| categoria_id | BIGINT FK | FK → categorias.id (cascadeOnDelete) | Categoría asociada |
| subrubro_id | BIGINT FK | FK → subrubros.id (cascadeOnDelete) | Subrubro asociado |
| created_at | TIMESTAMP | — | — |
| updated_at | TIMESTAMP | — | — |
| | | **UNIQUE(categoria_id, subrubro_id)** | Evita duplicados |

### `categoria_producto`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | BIGINT PK | auto | ID único |
| categoria_id | BIGINT FK | FK → categorias.id (cascadeOnDelete) | Categoría asociada |
| producto_id | BIGINT FK | FK → productos.id (cascadeOnDelete) | Producto asociado |
| created_at | TIMESTAMP | — | — |
| updated_at | TIMESTAMP | — | — |
| | | **UNIQUE(categoria_id, producto_id)** | Evita duplicados |

---

## Tablas del Sistema (Laravel)

### `personal_access_tokens`
Tabla de Sanctum para la autenticación por tokens Bearer.

| Columna | Tipo | Descripción |
|---|---|---|
| id | BIGINT PK | ID único |
| tokenable_id | BIGINT | ID del modelo (polimórfico) |
| tokenable_type | VARCHAR(255) | Clase del modelo (polimórfico) |
| name | VARCHAR(255) | Nombre del token (ej: "auth-token") |
| token | VARCHAR(64) | Hash único del token |
| abilities | TEXT null | Permisos del token |
| last_used_at | TIMESTAMP null | Último uso |
| expires_at | TIMESTAMP null | Expiración |
| created_at | TIMESTAMP | — |
| updated_at | TIMESTAMP | — |

### `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`
Tablas internas de Laravel para caché, sesiones y cola de trabajos. No tienen relaciones con la lógica del negocio.

---

## Relaciones entre Modelos (Eloquent)

### 1. Rubro → Subrubro (`1:N`)
- **`Rubro`** tiene `hasMany(Subrubro::class)` → un rubro puede tener muchos subrubros.
- **`Subrubro`** tiene `belongsTo(Rubro::class)` → cada subrubro pertenece a un único rubro.
- FK: `subrubros.rubro_id` → `rubros.id`
- Borrado en cascada: si se elimina un rubro, se eliminan sus subrubros.

### 2. Subrubro ↔ Categoría (`N:M`)
- **`Subrubro`** tiene `belongsToMany(Categoria::class, 'categoria_subrubro')`
- **`Categoria`** tiene `belongsToMany(Subrubro::class, 'categoria_subrubro')`
- Tabla pivot: `categoria_subrubro`
- **Evolución:** Originalmente cada categoría tenía un `subrubro_id` directo (1:N). Después se migró a N:M para permitir que una categoría pertenezca a múltiples subrubros.

### 3. Categoría ↔ Producto (`N:M`)
- **`Categoria`** tiene `belongsToMany(Producto::class, 'categoria_producto')`
- **`Producto`** tiene `belongsToMany(Categoria::class, 'categoria_producto')`
- Tabla pivot: `categoria_producto`
- **Evolución:** Originalmente cada producto tenía un `categoria_id` directo (1:N). Después se migró a N:M para permitir múltiples categorías por producto.

### 4. Rubro → Producto (`1:N`)
- **`Rubro`** tiene `hasMany(Producto::class)` → un rubro tiene muchos productos.
- **`Producto`** tiene `belongsTo(Rubro::class)` → cada producto pertenece a un rubro.
- FK: `productos.rubro_id` → `rubros.id`
- Borrado en cascada.

### 5. Subrubro → Producto (`1:N`)
- **`Producto`** tiene `belongsTo(Subrubro::class)` → cada producto pertenece a un subrubro.
- FK: `productos.subrubro_id` → `subrubros.id`
- Borrado en cascada.

### 6. Producto → Consulta (`1:N`)
- **`Producto`** tiene `hasMany(Consulta::class)` → un producto puede recibir muchas consultas.
- **`Consulta`** tiene `belongsTo(Producto::class)` → cada consulta es sobre un producto específico.
- FK: `consultas.producto_id` → `productos.id`
- Borrado en cascada.

### 7. User → personal_access_tokens (`1:N` — polimórfico)
- **`User`** usa `HasApiTokens` (Sanctum) → un usuario puede tener múltiples tokens.
- Tabla: `personal_access_tokens` con `tokenable_id` + `tokenable_type` (morphs).

---

## Resumen de Cardinalidades

| Desde | Hacia | Tipo | A través de |
|---|---|---|---|
| Rubro | Subrubro | 1:N | `subrubros.rubro_id` |
| Rubro | Producto | 1:N | `productos.rubro_id` |
| Subrubro | Producto | 1:N | `productos.subrubro_id` |
| Subrubro | Categoría | N:M | `categoria_subrubro` |
| Categoría | Producto | N:M | `categoria_producto` |
| Producto | Consulta | 1:N | `consultas.producto_id` |
| User | Token (Sanctum) | 1:N polimórfico | `personal_access_tokens` |

---

## Convenciones de Nombres

- **Tablas:** plural en inglés (salvo `rubros`, `subrubros`, `categorias`, `productos`, `consultas` — en español)
- **Modelos:** singular y capitalizados (ej: `Rubro`, `Subrubro`, `Categoria`, `Producto`, `Consulta`, `User`)
- **FKs:** `{tabla}_id` (ej: `rubro_id`, `subrubro_id`, `producto_id`)
- **Pivots:** singular_plural (ej: `categoria_subrubro`, `categoria_producto`) — orden alfabético
- **Timestamps:** `created_at`, `updated_at` automáticos de Laravel
