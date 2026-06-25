# Flujo de Autenticación — IG-WEB

> Stack: React 19 (frontend) + Laravel 12 (backend) + Sanctum (tokens Bearer)

---

## Registro de Cuenta

```
USUARIO                    FRONTEND                              BACKEND
───────                    ────────                              ───────
  │                          │                                      │
  │  Llena formulario        │                                      │
  │  (name, email,           │                                      │
  │   password, confirm)     │                                      │
  │                          │                                      │
  │  Click "Registrarse"     │                                      │
  │ ───────────────────────► │                                      │
  │                          │  POST /api/register                  │
  │                          │  { name, email,                      │
  │                          │    password,                          │
  │                          │    password_confirmation }            │
  │                          │ ──────────────────────────────────►  │
  │                          │                                      │  AuthController@register
  │                          │                                      │  ├─ Valida campos
  │                          │                                      │  ├─ Crea User con:
  │                          │                                      │  │   is_approved = false
  │                          │                                      │  │   is_admin = false
  │                          │                                      │  └─ Responde 201
  │                          │                                      │     { message, user }
  │                          │  ◄────────────────────────────────── │     (sin token)
  │                          │                                      │
  │  Muestra pantalla:       │                                      │
  │  "Cuenta creada —        │                                      │
  │   Pendiente de           │                                      │
  │   aprobación por         │                                      │
  │   un administrador"      │                                      │
  │ ◄─────────────────────── │                                      │
  │                          │                                      │
```

### Puntos clave del registro

- No se genera ningún token automáticamente.
- El usuario queda con `is_approved = false` y **no puede iniciar sesión**.
- Un administrador debe aprobarlo manualmente desde `/admin/usuarios`.

---

## Aprobación por Administrador

```
ADMIN                      FRONTEND                              BACKEND
─────                      ────────                              ───────
  │                          │                                      │
  │  Va a /admin/usuarios    │                                      │
  │  Ve lista de usuarios    │  GET /api/usuarios/pendientes        │
  │  con estado "Pendiente"  │  (con Bearer token)                  │
  │                          │ ──────────────────────────────────►  │
  │                          │                                      │  UserController@pendientes
  │                          │                                      │  └─ WHERE is_approved=false
  │                          │  ◄────────────────────────────────── │     AND is_admin=false
  │                          │                                      │
  │  Click "Aprobar"         │                                      │
  │ ───────────────────────► │  PATCH /api/usuarios/{id}/aprobar    │
  │                          │ ──────────────────────────────────►  │
  │                          │                                      │  UserController@aprobar
  │                          │                                      │  └─ SET is_approved = true
  │                          │  ◄────────────────────────────────── │
  │                          │                                      │
  │  O click "Rechazar"      │                                      │
  │ ───────────────────────► │  DELETE /api/usuarios/{id}/rechazar  │
  │                          │ ──────────────────────────────────►  │
  │                          │                                      │  UserController@rechazar
  │                          │                                      │  └─ DELETE user
  │                          │  ◄────────────────────────────────── │
```

---

## Inicio de Sesión

```
USUARIO                    FRONTEND                              BACKEND
───────                    ────────                              ───────
  │                          │                                      │
  │  Llena email + password  │                                      │
  │                          │                                      │
  │  Click "Entrar"          │                                      │
  │ ───────────────────────► │                                      │
  │                          │  POST /api/login                     │
  │                          │  { email, password }                 │
  │                          │ ──────────────────────────────────►  │
  │                          │                                      │  AuthController@login
  │                          │                                      │  ├─ Valida campos
  │                          │                                      │  ├─ Busca user por email
  │                          │                                      │  ├─ Hash::check(password)
  │                          │                                      │  │
  │                          │                      ┌───────────────┴────────┐
  │                          │                      │  ¿Credenciales OK?    │
  │                          │                      └───────────┬───────────┘
  │                          │                                  │
  │                          │                    ┌─────────────┴──────────┐
  │                          │                    │  ¿is_approved == true? │
  │                          │                    └─────────────┬──────────┘
  │                          │                                  │
  │                          │                      ┌───────────┴──────────┐
  │                          │                      │  createToken()       │
  │                          │                      │  "auth-token"        │
  │                          │                      └───────────┬──────────┘
  │                          │                                      │
  │                          │  ◄────────────────────────────────── │
  │                          │  { user, token }                     │
  │                          │                                      │
  │  Guarda en localStorage: │                                      │
  │  • token                 │                                      │
  │  • user (JSON)           │                                      │
  │                          │                                      │
  │  navigate('/admin/       │                                      │
  │    dashboard')           │                                      │
  │ ◄─────────────────────── │                                      │
  │                          │                                      │
```

### Errores posibles al iniciar sesión

| Situación | Mensaje |
|---|---|
| Email no registrado | "Las credenciales proporcionadas son incorrectas." |
| Password incorrecto | "Las credenciales proporcionadas son incorrectas." |
| Cuenta no aprobada | "Tu cuenta está pendiente de aprobación por un administrador." |
| Error de red/servidor | "Error al iniciar sesión" |

---

## Sesión Iniciada (Navegación Protegida)

```
┌─────────────────────────────────────────────────────┐
│                    ProtectedRoute                    │
│  ┌─────────────────────────────────────────────┐    │
│  │  ¿localStorage.getItem('token') existe?     │    │
│  ├─────────────────────────────────────────────┤    │
│  │  Sí  ───► Renderiza <Layout> + <Outlet>     │    │
│  │  No  ───► <Navigate to="/login" />           │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              Axios Interceptor (api.js)              │
│                                                     │
│  REQUEST INTERCEPTOR:                                │
│  ┌─────────────────────────────────────────────┐    │
│  │  Toma token de localStorage                 │    │
│  │  Agrega header: Authorization: Bearer <tok> │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  RESPONSE INTERCEPTOR:                               │
│  ┌─────────────────────────────────────────────┐    │
│  │  Si status 401:                             │    │
│  │  ├─ localStorage.removeItem('token')        │    │
│  │  ├─ localStorage.removeItem('user')         │    │
│  │  └─ window.location.href = '/login'         │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## Cierre de Sesión

```
USUARIO                    FRONTEND                              BACKEND
───────                    ────────                              ───────
  │                          │                                      │
  │  Click "Cerrar sesión"   │                                      │
  │  (dropdown del navbar)   │                                      │
  │ ───────────────────────► │                                      │
  │                          │  POST /api/logout                    │
  │                          │  (con Bearer token)                  │
  │                          │ ──────────────────────────────────►  │
  │                          │                                      │  AuthController@logout
  │                          │                                      │  └─ currentAccessToken()->delete()
  │                          │  ◄────────────────────────────────── │
  │                          │                                      │
  │  Limpia localStorage:    │                                      │
  │  • removeItem('token')   │                                      │
  │  • removeItem('user')    │                                      │
  │                          │                                      │
  │  navigate('/login')      │                                      │
  │ ◄─────────────────────── │                                      │
```

> Si el llamado a `/api/logout` falla (error de red, etc.), igual se limpia `localStorage` y se redirige al login.

---

## Usuario Admin por Defecto (Seeder)

```
Email:    admin@vitryo.com
Password: admin123
Rol:      is_admin = true, is_approved = true
```

---

## Archivos Clave

| Propósito | Ruta |
|---|---|
| Login (UI) | `resources/js/pages/Login.jsx` |
| Register (UI) | `resources/js/pages/Register.jsx` |
| Route guard | `resources/js/components/ProtectedRoute.jsx` |
| Axios + interceptors | `resources/js/services/api.js` |
| Navbar (logout + user info) | `resources/js/components/Navbar/Navbar.jsx` |
| Admin: gestión de usuarios | `resources/js/pages/Usuarios.jsx` |
| Router | `resources/js/App.jsx` |
| Auth controller | `app/Http/Controllers/AuthController.php` |
| User controller (aprobación) | `app/Http/Controllers/UserController.php` |
| Rutas API | `routes/api.php` |
| User model | `app/Models/User.php` |
| Admin seeder | `database/seeders/AdminUserSeeder.php` |
| Sanctum config | `config/sanctum.php` |
