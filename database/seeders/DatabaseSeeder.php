<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    // Ejecuta todos los seeders en el orden correcto respetando las dependencias
    // entre tablas (primero rubros, despues subrubros, etc.)
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            RubroSeeder::class,
            SubrubroSeeder::class,
            CategoriaSeeder::class,
            ProductoSeeder::class,
            ConsultaSeeder::class,
        ]);
    }
}
