<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Elimina la columna subrubro_id de categorias porque la relacion paso a ser
    // muchos a muchos mediante la tabla pivot categoria_subrubro
    public function up(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropForeign(['subrubro_id']);
            $table->dropColumn('subrubro_id');
        });
    }

    // Revierte: vuelve a agregar la columna subrubro_id como FK directa
    public function down(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->foreignId('subrubro_id')->constrained('subrubros')->cascadeOnDelete();
        });
    }
};
