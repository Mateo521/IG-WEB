<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subrubros');
    }
};
