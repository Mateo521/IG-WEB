<?php

namespace Database\Seeders;

use App\Models\Producto;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = range(1, 12);

        foreach ($categorias as $categoriaId) {
            Producto::create([
                'nombreProducto' => "Producto {$categoriaId}.1",
                'descripcion' => "Descripción del Producto {$categoriaId}.1",
                'precio' => rand(100, 9999) / 100,
                'rutaImg' => null,
                'categoria_id' => $categoriaId,
            ]);

            Producto::create([
                'nombreProducto' => "Producto {$categoriaId}.2",
                'descripcion' => "Descripción del Producto {$categoriaId}.2",
                'precio' => rand(100, 9999) / 100,
                'rutaImg' => null,
                'categoria_id' => $categoriaId,
            ]);
        }
    }
}
