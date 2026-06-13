<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Crea la tabla pivot para la relacion muchos a muchos entre categorias y productos.
    // La constraint unique evita duplicados en el par (categoria_id, producto_id)
    public function up(): void
    {
        Schema::create('categoria_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['categoria_id', 'producto_id']);
        });
    }

    // Revierte la migracion: elimina la tabla pivot
    public function down(): void
    {
        Schema::dropIfExists('categoria_producto');
    }
};
