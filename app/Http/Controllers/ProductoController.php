<?php

namespace App\Http\Controllers;

use App\Http\Requests\AlmacenarProductoRequest;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller
{
    public function index()
    {
        $productos = Producto::with('rubro', 'subrubro', 'categorias')->orderBy('id', 'desc')->get();
        return response()->json($productos);
    }

    public function store(AlmacenarProductoRequest $request)
    {
        $datos = $request->validated();

        if ($request->hasFile('imagen')) {
            $imagen = $request->file('imagen');
            $nombre = time() . '_' . $imagen->getClientOriginalName();
            $ruta = $imagen->storeAs('productos', $nombre, 'public');

            if (class_exists(\Intervention\Image\Laravel\Facades\Image::class)) {
                $this->comprimirImagen(storage_path('app/public/' . $ruta));
            }

            $datos['rutaImg'] = $ruta;
            unset($datos['imagen']);
        }

        $categorias = $datos['categorias'] ?? [];
        unset($datos['categorias']);

        $producto = Producto::create($datos);

        if (!empty($categorias)) {
            $producto->categorias()->attach($categorias);
        }

        $producto->load('rubro', 'subrubro', 'categorias');

        return response()->json([
            'mensaje' => 'Producto creado con éxito',
            'producto' => $producto
        ], 201);
    }

    public function show($id)
    {
        $producto = Producto::with('rubro', 'subrubro', 'categorias')->findOrFail($id);
        return response()->json($producto);
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);

        $datos = $request->validate([
            'nombreProducto' => 'required|string|max:255',
            'descripcion'    => 'required|string',
            'precio'         => 'required|numeric|min:0',
            'rubro_id'       => 'required|exists:rubros,id',
            'subrubro_id'    => 'required|exists:subrubros,id',
            'categorias'     => 'required|array',
            'categorias.*'   => 'exists:categorias,id',
            'imagen'         => 'sometimes|image|max:2048',
        ]);

        if ($request->hasFile('imagen')) {
            if ($producto->rutaImg) {
                Storage::disk('public')->delete($producto->rutaImg);
            }

            $imagen = $request->file('imagen');
            $nombre = time() . '_' . $imagen->getClientOriginalName();
            $datos['rutaImg'] = $imagen->storeAs('productos', $nombre, 'public');

            if (class_exists(\Intervention\Image\Laravel\Facades\Image::class)) {
                $this->comprimirImagen(storage_path('app/public/' . $datos['rutaImg']));
            }
        }

        $categorias = $datos['categorias'] ?? [];
        unset($datos['categorias']);

        $producto->update($datos);

        if (!empty($categorias)) {
            $producto->categorias()->sync($categorias);
        }

        $producto->load('rubro', 'subrubro', 'categorias');

        return response()->json([
            'mensaje' => 'Producto actualizado',
            'producto' => $producto
        ]);
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);

        if ($producto->rutaImg) {
            Storage::disk('public')->delete($producto->rutaImg);
        }

        $producto->categorias()->detach();
        $producto->delete();

        return response()->json(['mensaje' => 'Producto eliminado correctamente']);
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