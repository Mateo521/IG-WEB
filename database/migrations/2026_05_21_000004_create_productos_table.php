<?php
# php artisan make:model Producto -s
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
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
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
