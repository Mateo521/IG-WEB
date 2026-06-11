<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    // Crea la tabla subrubros con clave foranea a rubros
    // Si se elimina un rubro, sus subrubros se borran en cascada
    public function up(): void
{
    Schema::create('subrubros', function (Blueprint $table) {
        $table->id();
        $table->string('nombreSubrubro');
        
        
        $table->foreignId('rubro_id')
              ->constrained('rubros')
              ->onDelete('cascade');  
              
        $table->timestamps();
    });
}

    // Revierte la migracion: elimina la tabla subrubros
    public function down(): void
    {
        Schema::dropIfExists('subrubros');
    }
};
