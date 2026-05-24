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
        $productos = Producto::with('categoria.subrubro.rubro')->orderBy('id', 'desc')->get();
        return response()->json($productos);
    }

    public function store(AlmacenarProductoRequest $request)
    {
        $datos = $request->validated();

        if ($request->hasFile('imagen')) {
            $rutaImagen = $request->file('imagen')->store('productos', 'public');
            
            $datos['rutaImg'] = $rutaImagen; 
        }

        $producto = Producto::create($datos);

        return response()->json([
            'mensaje' => 'Producto creado con éxito',
            'producto' => $producto
        ], 201); 
    }


    public function show($id)
    {
        $producto = Producto::with('categoria')->findOrFail($id);
        return response()->json($producto);
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);

        $datos = $request->validate([
            'nombreProducto' => 'required|string|max:255',
            'descripcion'    => 'required|string',
            'precio'         => 'required|numeric|min:0',
            'categoria_id'   => 'required|exists:categorias,id',
            'imagen'         => 'sometimes|image|max:2048',
        ]);

        if ($request->hasFile('imagen')) {
            if ($producto->rutaImg) {
                Storage::disk('public')->delete($producto->rutaImg);
            }
            $datos['rutaImg'] = $request->file('imagen')->store('productos', 'public');
        }

        $producto->update($datos);

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

        $producto->delete();

        return response()->json(['mensaje' => 'Producto eliminado correctamente']);
    }

}