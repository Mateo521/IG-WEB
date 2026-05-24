<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropForeign(['subrubro_id']);
            $table->dropColumn('subrubro_id');
        });
    }

    public function down(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->foreignId('subrubro_id')->constrained('subrubros')->cascadeOnDelete();
        });
    }
};
