<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Migra la tabla productos del esquema antiguo (categoria_id directa) al nuevo:
    // elimina categoria_id y agrega rubro_id y subrubro_id como FK.
    // Las categorias ahora se vinculan via la tabla pivot categoria_producto
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->dropColumn('categoria_id');

            $table->foreignId('rubro_id')->constrained('rubros')->cascadeOnDelete();
            $table->foreignId('subrubro_id')->constrained('subrubros')->cascadeOnDelete();
        });
    }

    // Revierte: vuelve al esquema antiguo con categoria_id y elimina rubro_id/subrubro_id
    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['rubro_id']);
            $table->dropColumn('rubro_id');
            $table->dropForeign(['subrubro_id']);
            $table->dropColumn('subrubro_id');

            $table->foreignId('categoria_id')->constrained('categorias')->cascadeOnDelete();
        });
    }
};
