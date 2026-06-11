<?php

namespace Database\Seeders;

use App\Models\Rubro;
use Illuminate\Database\Seeder;

class RubroSeeder extends Seeder
{
    // Crea 3 rubros de prueba para poblar la base de datos inicial
    public function run(): void
    {
        Rubro::create(['nombreRubro' => 'Rubro 1']);
        Rubro::create(['nombreRubro' => 'Rubro 2']);
        Rubro::create(['nombreRubro' => 'Rubro 3']);
    }
}
