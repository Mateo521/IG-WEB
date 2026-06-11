<?php

use Illuminate\Support\Facades\Route;

// Sirve archivos del storage (imágenes, etc.) ANTES del catch-all del SPA
// para que php artisan serve maneje correctamente el symlink public/storage
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

// Sirve el SPA React para todas las rutas no-API
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
