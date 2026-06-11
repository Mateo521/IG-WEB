<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Crea la tabla rubros con su nombre y timestamps de creacion/actualizacion
    public function up(): void
{
    Schema::create('rubros', function (Blueprint $table) {
        $table->id();
        $table->string('nombreRubro');
        $table->timestamps();
    });
}

    // Si la migracion se revierte, elimina la tabla rubros
    public function down(): void
    {
        Schema::dropIfExists('rubros');
    }
};
