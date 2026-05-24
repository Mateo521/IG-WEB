<?php

namespace Database\Seeders;

use App\Models\Producto;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $rubroSubrubroCats = [
            ['rubro' => 1, 'subrubro' => 1, 'cats' => [1, 2]],
            ['rubro' => 1, 'subrubro' => 2, 'cats' => [3, 4]],
            ['rubro' => 2, 'subrubro' => 3, 'cats' => [5, 6]],
            ['rubro' => 2, 'subrubro' => 4, 'cats' => [7, 8]],
            ['rubro' => 3, 'subrubro' => 5, 'cats' => [9, 10]],
            ['rubro' => 3, 'subrubro' => 6, 'cats' => [11, 12]],
        ];

        $idx = 1;
        foreach ($rubroSubrubroCats as $grupo) {
            foreach ($grupo['cats'] as $catId) {
                for ($i = 1; $i <= 2; $i++) {
                    $producto = Producto::create([
                        'nombreProducto' => "Producto {$idx}.{$i}",
                        'descripcion' => "Descripción del Producto {$idx}.{$i}",
                        'precio' => rand(100, 9999) / 100,
                        'rutaImg' => null,
                        'rubro_id' => $grupo['rubro'],
                        'subrubro_id' => $grupo['subrubro'],
                    ]);
                    $producto->categorias()->attach($catId);
                }
            }
            $idx++;
        }
    }
}
