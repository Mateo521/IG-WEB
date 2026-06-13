<?php

namespace Database\Seeders;

use App\Models\Subrubro;
use Illuminate\Database\Seeder;

class SubrubroSeeder extends Seeder
{
    // Crea 6 subrubros, 2 por cada rubro, para tener datos de prueba con relaciones
    public function run(): void
    {
        Subrubro::create(['nombreSubrubro' => 'Subrubro 1.1', 'rubro_id' => 1]);
        Subrubro::create(['nombreSubrubro' => 'Subrubro 1.2', 'rubro_id' => 1]);
        Subrubro::create(['nombreSubrubro' => 'Subrubro 2.1', 'rubro_id' => 2]);
        Subrubro::create(['nombreSubrubro' => 'Subrubro 2.2', 'rubro_id' => 2]);
        Subrubro::create(['nombreSubrubro' => 'Subrubro 3.1', 'rubro_id' => 3]);
        Subrubro::create(['nombreSubrubro' => 'Subrubro 3.2', 'rubro_id' => 3]);
    }
}
