# SCRUM — IG-WEB

## Datos del Proyecto

| Campo | Detalle |
|---|---|
| **Proyecto** | IG-WEB — Sistema web para gestión de PoliRubro |
| **Metodología** | SCRUM (ágil) |
| **Duración de Sprints** | 1 semana |
| **Total de Sprints** | 3 |

## Roles

| Rol | Responsable |
|---|---|
| **Product Owner** | Valentín, Mateo |
| **Scrum Master** | Valentín |
| **Developers** | Valentín (Frontend + Integración API + Diseño UI + Testing frontend), Mateo (Backend + APIs REST + Base de Datos + Autenticación) |

## Product Backlog

| ID | Historia de Usuario | Prioridad |
|---|---|---|
| HU1 | Como administrador quiero iniciar sesión | Alta |
| HU2 | Como administrador quiero crear productos | Alta |
| HU3 | Como administrador quiero editar productos | Alta |
| HU4 | Como administrador quiero eliminar productos | Alta |
| HU5 | Como cliente quiero visualizar productos | Alta |
| HU6 | Como cliente quiero filtrar productos | Media |
| HU7 | Como cliente quiero buscar productos | Alta |
| HU8 | Como cliente quiero consultar un producto | Alta |
| HU9 | Como administrador quiero gestionar categorías | Media |
| HU10 | Como administrador quiero visualizar consultas | Media |

---

## Sprint 1 — Planificación y Estructura Inicial

**Período:** 21/05/2026

### Objetivos

- Definir el alcance general del sistema
- Diseñar la estructura inicial del proyecto
- Modelado de Casos de Uso
- Modelado de Clases
- CRUD de productos, rubros, subrubros y categorías

### Tareas planificadas

- Configurar base de datos
- Diseñar modelo relacional
- Definir estructura de carpetas
- Definir rutas principales de la API

### Entregables planificados

- Proyecto base funcional
- Arquitectura inicial definida
- Base de datos diseñada
- Backend funcional

### Qué se construyó

- Backend Laravel 12 con API REST
- Modelos Eloquent: `Rubro`, `Subrubro`, `Categoria`, `Producto`, `Consulta`, `User`
- Migraciones con relaciones 1:N:
  - `Rubro → Subrubro`
  - `Subrubro → Categoria`
  - `Categoria → Producto`
- CRUD completo de rubros, subrubros, categorías, productos y consultas
- Seeders con datos de prueba: 3 rubros, 6 subrubros, 12 categorías, 24 productos, 6 consultas
- Base de datos SQLite
- Rutas API definidas en `routes/api.php`

### Tareas por desarrollador

| Desarrollador | Tareas |
|---|---|
| **Mateo** | Backend Laravel, modelos Eloquent, migraciones, seeders, controladores CRUD, rutas API |
| **Valentín** | Colaboración en definición de estructura, modelo relacional y ajustes del backend |

---

## Sprint 2 — Desarrollo Base del Sistema

**Período:** 29/05/2026

### Objetivos

- Implementar funcionalidades principales del sistema
- Construir panel administrativo

### Tareas planificadas

- Login administrador
- Migraciones y seeders
- Dashboard administrador
- Formularios ABM
- Validaciones frontend y backend

### Entregables planificados

- Panel administrador operativo
- Gestión completa de productos y categorías

### Qué se construyó

- **Autenticación con Laravel Sanctum**: `AuthController` con `register`, `login`, `logout`
- **Frontend React + Vite** (inicialmente en carpeta `frontend/`)
- **Panel administrador protegido** bajo `/admin/*`:
  - `ProtectedRoute` que verifica token en localStorage
  - `Layout` + `Navbar` con logout y navegación a CRUDs
  - CRUDs de rubros, subrubros, categorías, productos
  - `Dashboard` con cards de acceso rápido
- **Catálogo público** en `/` sin autenticación
- **Rediseño del esquema de BD**: migración de relaciones 1:N a M:N
  - Tablas pivot: `categoria_subrubro`, `categoria_producto`
  - Eliminación de FK directas: `subrubro_id` de categorías, `categoria_id` de productos
  - Productos ahora referencian `rubro_id` y `subrubro_id` directos + categorías vía pivot
- **Cascading selects** en formulario de producto (Rubro → Subrubro → Categorías)
- **Compresión de imágenes** con Intervention Image (scaleDown 800px, calidad 75%)
- Seeders actualizados para las nuevas relaciones M:N

### Tareas por desarrollador

| Desarrollador | Tareas |
|---|---|
| **Mateo** | AuthController con Sanctum, migraciones del rediseño M:N, actualización de controladores (ProductoController, CategoriaController), compresión de imágenes, seeders M:N |
| **Valentín** | Proyecto React + Vite, componentes del panel admin (Login, Register, CRUDs, Layout, Navbar, Dashboard), catálogo público, cascading selects, integración API |

### Desvíos y cambios respecto a la planificación

- Se migró el esquema de BD de 1:N a M:N para dar flexibilidad a la jerarquía Rubro → Subrubro → Categoría → Producto
- Se agregó compresión de imágenes con Intervention (no contemplado originalmente)
- El frontend se desarrolló en carpeta separada `frontend/` (luego unificada en Sprint 3)

---

## Sprint 3 — Frontend Público, Testing y Entrega Final

**Período:** 12/06/2026

### Objetivos

- Finalizar experiencia de usuario
- Integrar funcionalidades públicas
- Realizar testing general

### Tareas planificadas

- Home pública
- Catálogo de productos
- Sistema de filtros
- Buscador de productos
- Vista detalle producto
- Sistema de consultas
- Validaciones generales
- Corrección de errores
- Optimización UI/UX
- Testing final

### Entregables planificados

- Sistema completamente funcional
- Frontend público operativo
- Testing realizado
- Proyecto listo para presentación

### Qué se construyó

- **Unificación Laravel + React**: se eliminó la carpeta `frontend/` y se movió todo a `resources/js/` (estructura estándar de Laravel)
- **`vite.config.js`** unificado con plugin React + proxy a Laravel
- **Catálogo con filtros y búsqueda server-side** (`ProductoController@index`):
  - Parámetros: `search`, `rubro_id`, `subrubro_id`, `categoria_id`, `precio_min`, `precio_max`, `sort`
  - Paginación server-side con respuesta JSON paginada
  - `SidebarFiltros` con selects en cascada, rango de precio y ordenamiento
  - `Paginacion` con botones numerados y separadores inteligentes
  - `ProductoCardSkeleton` con shimmer de carga
  - Chips de filtros activos con opción de quitarlos individualmente
  - Toggle grilla/lista con preferencia guardada en localStorage
  - Contador de resultados
  - Diseño responsive
- **Dashboard con métricas reales**: endpoint `/api/stats` con conteos, skeleton loading, fallback `—` en errores
- **Importar/Exportar CSV** de productos:
  - Importación con validación por fila y reporte de errores
  - Exportación con filtros reutilizando `queryFiltrada()`
  - Descarga de plantilla CSV desde el frontend
- **Autenticación por roles y aprobación de usuarios**:
  - Columnas `is_admin` e `is_approved` en `users`
  - Registro sin auto-login (cuenta pendiente de aprobación)
  - Login bloqueado si `is_approved = false`
  - `UserController` con endpoints: listar, pendientes, aprobar, rechazar
  - `Usuarios.jsx` con tabla de gestión, badges de estado y botones Aprobar/Rechazar
  - Navbar condicional: link "Usuarios" solo visible para admin
  - Dashboard adaptativo: admin ve 6 cards (incluye Usuarios), usuario normal ve 5
- Seeder de usuario admin por defecto: `admin@vitryo.com` / `admin123`

### Tareas por desarrollador

| Desarrollador | Tareas |
|---|---|
| **Mateo** | Filtros server-side en ProductoController, DashboardController con `/api/stats`, importar/exportar CSV, UserController, columna is_approved/is_admin, lógica de aprobación en AuthController |
| **Valentín** | Unificación Laravel + React, SidebarFiltros, Paginacion, ProductoCardSkeleton, Dashboard.jsx con métricas, Productos.jsx con CSV, Usuarios.jsx, Register.jsx/Login.jsx modificados, Navbar condicional, responsive design |

### Desvíos y cambios respecto a la planificación

- Se unificó el frontend dentro de Laravel (no se mantuvieron proyectos separados)
- Se agregó sistema de importación/exportación CSV (no contemplado originalmente)
- Se implementó aprobación de usuarios con roles (is_admin/is_approved), reemplazando el login simple planificado
- Se agregó Dashboard con métricas dinámicas (originalmente era estático)

---

## MVP — Producto Mínimo Viable

| Funcionalidad | Estado |
|---|---|
| Login administrador | ✅ Implementado con aprobación de usuarios |
| CRUD de productos | ✅ Implementado |
| CRUD de rubros y categorías | ✅ Implementado (rubros, subrubros, categorías) |
| Visualización pública de productos | ✅ Implementado con filtros y búsqueda |
| Sistema de filtros | ✅ Implementado (server-side con sidebar) |
| Sistema de consultas | ✅ Implementado |

---

## Kanban del Proyecto

| Tarea | Responsable | Estado |
|---|---|---|
| Configurar base de datos y modelo relacional | Mateo | ✅ Finalizado |
| CRUD rubros, subrubros, categorías (backend) | Mateo | ✅ Finalizado |
| CRUD productos (backend) | Mateo | ✅ Finalizado |
| Autenticación con Sanctum | Mateo | ✅ Finalizado |
| Migración a relaciones M:N | Mateo | ✅ Finalizado |
| Compresión de imágenes | Mateo | ✅ Finalizado |
| Filtros y búsqueda server-side | Mateo | ✅ Finalizado |
| Dashboard con métricas | Mateo | ✅ Finalizado |
| Importar/Exportar CSV | Mateo | ✅ Finalizado |
| Aprobación de usuarios (UserController) | Mateo | ✅ Finalizado |
| Frontend React + Vite (inicial) | Valentín | ✅ Finalizado |
| Panel admin: CRUDs, Layout, Navbar | Valentín | ✅ Finalizado |
| Catálogo público | Valentín | ✅ Finalizado |
| Cascading selects en formularios | Valentín | ✅ Finalizado |
| Unificación Laravel + React | Valentín | ✅ Finalizado |
| SidebarFiltros, Paginacion, Skeleton | Valentín | ✅ Finalizado |
| Dashboard frontend con métricas | Valentín | ✅ Finalizado |
| Importar/Exportar CSV (frontend) | Valentín | ✅ Finalizado |
| Usuarios.jsx (gestión de aprobación) | Valentín | ✅ Finalizado |
| Navbar condicional por rol | Valentín | ✅ Finalizado |
| Diseño responsive | Valentín | ✅ Finalizado |
| Testing general | Valentín + Mateo | ✅ Finalizado |

---

## Definición de Done (DoD)

Una tarea se considera finalizada cuando:

- ✅ El desarrollo está completo
- ✅ Existen pruebas funcionales
- ✅ El código está integrado
- ✅ El código está subido a GitHub
- ✅ No existen errores críticos

---

## Tecnologías Utilizadas

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19, React Router DOM 7, Vite 7, Tailwind CSS |
| **Backend** | Laravel 12, PHP 8.2+ |
| **Base de Datos** | SQLite |
| **Autenticación** | Laravel Sanctum (tokens Bearer) |
| **Imágenes** | Intervention Image |
| **Herramientas** | GitHub, Postman, Figma, Canvas IA |
