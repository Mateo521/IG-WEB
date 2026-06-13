<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    // Crea 12 categorias, cada una asociada a uno o mas subrubros via la tabla pivot.
    // La ultima categoria esta vinculada a 2 subrubros para demostrar la relacion N:M.
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Categoria 1.1.1', 'subrubros' => [1]],
            ['nombre' => 'Categoria 1.1.2', 'subrubros' => [1]],
            ['nombre' => 'Categoria 1.2.1', 'subrubros' => [2]],
            ['nombre' => 'Categoria 1.2.2', 'subrubros' => [2]],
            ['nombre' => 'Categoria 2.1.1', 'subrubros' => [3]],
            ['nombre' => 'Categoria 2.1.2', 'subrubros' => [3]],
            ['nombre' => 'Categoria 2.2.1', 'subrubros' => [4]],
            ['nombre' => 'Categoria 2.2.2', 'subrubros' => [4]],
            ['nombre' => 'Categoria 3.1.1', 'subrubros' => [5]],
            ['nombre' => 'Categoria 3.1.2', 'subrubros' => [5]],
            ['nombre' => 'Categoria 3.2.1', 'subrubros' => [6]],
            ['nombre' => 'Categoria 3.2.2', 'subrubros' => [6, 1]],
        ];

        foreach ($categorias as $item) {
            $categoria = Categoria::create(['nombreCategoria' => $item['nombre']]);
            $categoria->subrubros()->attach($item['subrubros']);
        }
    }
}
