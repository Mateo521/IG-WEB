<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RubroController;
use App\Http\Controllers\SubrubroController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ConsultaController;

// Rutas de autenticacion: registro e inicio de sesion son publicos
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
// Cerrar sesion necesita estar autenticado para saber que token eliminar
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Devuelve el usuario autenticado actualmente (util para que el frontend verifique la sesion)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// CRUD de rubros, subrubros y categorias
Route::apiResource('rubros', RubroController::class);
Route::apiResource('subrubros', SubrubroController::class);
Route::apiResource('categorias', CategoriaController::class);

// Las rutas de importacion y exportacion van ANTES de apiResource para que
// Laravel no confunda "importar" o "exportar" con un ID de producto en /productos/{producto}
Route::post('/productos/importar', [ProductoController::class, 'importar']);
Route::get('/productos/exportar',  [ProductoController::class, 'exportar']);
Route::apiResource('productos', ProductoController::class);

// CRUD de consultas mas una ruta adicional para marcarlas como leidas
Route::apiResource('consultas', ConsultaController::class);
Route::patch('/consultas/{consulta}/leer', [ConsultaController::class, 'marcarLeida']);

// Estadisticas para el dashboard del admin: devuelve contadores de cada entidad
Route::get('/stats', [DashboardController::class, 'stats']);
