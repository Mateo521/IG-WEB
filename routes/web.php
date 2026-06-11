<?php

use Illuminate\Support\Facades\Route;

// Sirve archivos del storage (imagenes de productos, etc.) para php artisan serve
// Incluye una validacion para evitar path traversal (que alguien acceda a archivos fuera de app/public)
Route::get('/storage/{path}', function (string $path) {
    $fullPath = storage_path('app/public/' . $path);
    if (!str_starts_with(realpath($fullPath), storage_path('app/public'))) {
        abort(404);
    }
    if (!file_exists($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath);
})->where('path', '.*');

// Ruta catch-all: cualquier ruta que no sea API ni storage se resuelve con el SPA de React
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
