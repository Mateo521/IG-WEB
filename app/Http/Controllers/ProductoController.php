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
        $productos = Producto::with('categoria')->orderBy('id', 'desc')->get();
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
        
        // validar los datos nuevos (ver)

        $datos = $request->all();


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