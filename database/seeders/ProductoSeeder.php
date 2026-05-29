<?php

namespace Database\Seeders;

use App\Models\Producto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $sourceDir = database_path('seeders/assets/productos');
        $images = glob($sourceDir . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);

        $processedImages = [];
        foreach ($images as $sourcePath) {
            $ext = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION));
            $filename = Str::uuid() . '.' . $ext;
            $destPath = 'productos/' . $filename;

            Storage::disk('public')->put($destPath, file_get_contents($sourcePath));

            $fullPath = storage_path('app/public/' . $destPath);
            $this->comprimirImagen($fullPath);

            $processedImages[] = $destPath;
        }

        if (empty($processedImages)) {
            $processedImages[] = null;
        }

        $rubroSubrubroCats = [
            ['rubro' => 1, 'subrubro' => 1, 'cats' => [1, 2]],
            ['rubro' => 1, 'subrubro' => 2, 'cats' => [3, 4]],
            ['rubro' => 2, 'subrubro' => 3, 'cats' => [5, 6]],
            ['rubro' => 2, 'subrubro' => 4, 'cats' => [7, 8]],
            ['rubro' => 3, 'subrubro' => 5, 'cats' => [9, 10]],
            ['rubro' => 3, 'subrubro' => 6, 'cats' => [11, 12]],
        ];

        $globalIdx = 1;
        foreach ($rubroSubrubroCats as $grupo) {
            foreach ($grupo['cats'] as $catId) {
                for ($i = 1; $i <= 2; $i++) {
                    $imgIndex = ($globalIdx - 1) % count($processedImages);
                    $rutaImg = $processedImages[$imgIndex] ?? null;

                    $producto = Producto::create([
                        'nombreProducto' => "Producto {$globalIdx}",
                        'descripcion' => "Descripción del Producto {$globalIdx}",
                        'precio' => rand(100, 9999) / 100,
                        'rutaImg' => $rutaImg,
                        'rubro_id' => $grupo['rubro'],
                        'subrubro_id' => $grupo['subrubro'],
                    ]);
                    $producto->categorias()->attach($catId);

                    $globalIdx++;
                }
            }
        }
    }

    private function comprimirImagen(string $fullPath): void
    {
        try {
            $img = \Intervention\Image\Laravel\Facades\Image::read($fullPath);
            $img->scaleDown(width: 800);
            $img->save(null, 75);
        } catch (\Throwable) {
            try {
                $img = \Intervention\Image\Laravel\Facades\Image::make($fullPath);
                $img->resize(800, null, function ($c) { $c->aspectRatio(); });
                $img->save(null, 75);
            } catch (\Throwable) {
            }
        }
    }
}
