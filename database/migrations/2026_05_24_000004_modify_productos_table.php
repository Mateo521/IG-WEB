<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->dropColumn('categoria_id');

            $table->foreignId('rubro_id')->constrained('rubros')->cascadeOnDelete();
            $table->foreignId('subrubro_id')->constrained('subrubros')->cascadeOnDelete();
        });
    }

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
