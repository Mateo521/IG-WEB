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

### 7. (Opcional) Crear enlace para imágenes

```bash
php artisan storage:link
```

### 8. Iniciar el servidor

```bash
php artisan serve
```

La API corre en `http://localhost:8000`.

---

## Endpoints disponibles

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
| GET | `/api/user` | Usuario autenticado (requiere token) |

---

## Estructura entregada

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
