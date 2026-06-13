<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Crea la tabla categorias. Originalmente tenia subrubro_id como FK directa,
    // despues se migro a muchos a muchos con tabla pivot (ver migracion 2026_05_24_000003)
    public function up(): void
{
    Schema::create('categorias', function (Blueprint $table) {
        $table->id();
        $table->string('nombreCategoria');
        
        
        $table->foreignId('subrubro_id')
              ->constrained('subrubros')
              ->onDelete('cascade');
              
        $table->timestamps();
    });
}

    public function down(): void
    {
        //
    }
};
