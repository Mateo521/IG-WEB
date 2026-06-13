<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    // Crea la tabla productos con precio decimal, ruta de imagen opcional,
    // y clave foranea a categoria (luego migrada a relacion N:M en 2026_05_24_000004)
    public function up(): void
{
    Schema::create('productos', function (Blueprint $table) {
        $table->id();
        $table->string('nombreProducto');  
        $table->text('descripcion');     
        $table->decimal('precio', 10, 2);  
        $table->string('rutaImg')->nullable();  
        
        
        $table->foreignId('categoria_id')
              ->constrained('categorias')
              ->onDelete('cascade');
              
        $table->timestamps();
    });
}
    // Revierte la migracion: elimina la tabla productos
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
