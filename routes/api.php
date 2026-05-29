<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
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
Route::apiResource('productos', ProductoController::class);
Route::apiResource('consultas', ConsultaController::class);