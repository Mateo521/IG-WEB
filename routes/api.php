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


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::apiResource('rubros', RubroController::class);
Route::apiResource('subrubros', SubrubroController::class);
Route::apiResource('categorias', CategoriaController::class);

// Rutas de importación y exportación — van ANTES de apiResource para que
// Laravel no confunda "importar"/"exportar" con un ID de producto en la ruta /{producto}
Route::post('/productos/importar', [ProductoController::class, 'importar']);
Route::get('/productos/exportar',  [ProductoController::class, 'exportar']);
Route::apiResource('productos', ProductoController::class);

Route::apiResource('consultas', ConsultaController::class);

// Estadísticas para el dashboard admin: devuelve contadores de cada entidad
Route::get('/stats', [DashboardController::class, 'stats']);