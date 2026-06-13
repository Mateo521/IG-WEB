<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Agrega la columna booleana 'visto' a la tabla consultas para que el admin
    // pueda marcar cuales consultas ya fueron revisadas. Por defecto es false.
    public function up(): void
    {
        Schema::table('consultas', function (Blueprint $table) {
            $table->boolean('visto')->default(false)->after('mensaje');
        });
    }

    // Revierte: elimina la columna visto
    public function down(): void
    {
        Schema::table('consultas', function (Blueprint $table) {
            $table->dropColumn('visto');
        });
    }
};
