<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        Categoria::create(['nombreCategoria' => 'Categoria 1.1.1', 'subrubro_id' => 1]);
        Categoria::create(['nombreCategoria' => 'Categoria 1.1.2', 'subrubro_id' => 1]);
        Categoria::create(['nombreCategoria' => 'Categoria 1.2.1', 'subrubro_id' => 2]);
        Categoria::create(['nombreCategoria' => 'Categoria 1.2.2', 'subrubro_id' => 2]);
        Categoria::create(['nombreCategoria' => 'Categoria 2.1.1', 'subrubro_id' => 3]);
        Categoria::create(['nombreCategoria' => 'Categoria 2.1.2', 'subrubro_id' => 3]);
        Categoria::create(['nombreCategoria' => 'Categoria 2.2.1', 'subrubro_id' => 4]);
        Categoria::create(['nombreCategoria' => 'Categoria 2.2.2', 'subrubro_id' => 4]);
        Categoria::create(['nombreCategoria' => 'Categoria 3.1.1', 'subrubro_id' => 5]);
        Categoria::create(['nombreCategoria' => 'Categoria 3.1.2', 'subrubro_id' => 5]);
        Categoria::create(['nombreCategoria' => 'Categoria 3.2.1', 'subrubro_id' => 6]);
        Categoria::create(['nombreCategoria' => 'Categoria 3.2.2', 'subrubro_id' => 6]);
    }
}
