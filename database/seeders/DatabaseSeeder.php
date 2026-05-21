<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RubroSeeder::class,
            SubrubroSeeder::class,
            CategoriaSeeder::class,
            ProductoSeeder::class,
            ConsultaSeeder::class,
        ]);
    }
}
