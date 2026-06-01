<?php

use Illuminate\Support\Facades\Route;

// Sirve el SPA React para todas las rutas no-API
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
