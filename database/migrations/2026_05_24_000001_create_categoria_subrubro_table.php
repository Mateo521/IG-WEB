<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categoria_subrubro', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias')->cascadeOnDelete();
            $table->foreignId('subrubro_id')->constrained('subrubros')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['categoria_id', 'subrubro_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categoria_subrubro');
    }
};
