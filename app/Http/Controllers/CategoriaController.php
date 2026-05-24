<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        return response()->json(Categoria::with('subrubro', 'productos')->get());
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombreCategoria' => 'required|string|max:255',
            'subrubro_id' => 'required|exists:subrubros,id'  
        ]);

        $categoria = Categoria::create($datos);

        return response()->json([
            'mensaje' => 'Categoría creada con éxito',
            'categoria' => $categoria
        ], 201);
    }

    public function show($id)
    {
        $categoria = Categoria::with(['subrubro', 'productos'])->findOrFail($id);
        return response()->json($categoria);
    }

    public function update(Request $request, $id)
    {
        $categoria = Categoria::findOrFail($id);

        $datos = $request->validate([
            'nombreCategoria' => 'required|string|max:255',
            'subrubro_id' => 'sometimes|exists:subrubros,id'
        ]);

        $categoria->update($datos);

        return response()->json([
            'mensaje' => 'Categoría actualizada con éxito',
            'categoria' => $categoria
        ]);
    }

    public function destroy($id)
    {
        $categoria = Categoria::findOrFail($id);
        
        $categoria->delete();

        return response()->json(['mensaje' => 'Categoría eliminada correctamente']);
    }
}