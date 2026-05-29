<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index(Request $request)
    {
        $query = Categoria::with('subrubros', 'productos');

        if ($request->has('subrubro_id')) {
            $query->whereHas('subrubros', fn($q) => $q->where('subrubro_id', $request->subrubro_id));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombreCategoria' => 'required|string|max:255',
            'subrubros' => 'required|array',
            'subrubros.*' => 'exists:subrubros,id',
        ]);

        $categoria = Categoria::create($datos);
        $categoria->subrubros()->attach($request->subrubros);

        return response()->json([
            'mensaje' => 'Categoría creada con éxito',
            'categoria' => $categoria->load('subrubros', 'productos')
        ], 201);
    }

    public function show($id)
    {
        $categoria = Categoria::with(['subrubros', 'productos'])->findOrFail($id);
        return response()->json($categoria);
    }

    public function update(Request $request, $id)
    {
        $categoria = Categoria::findOrFail($id);

        $datos = $request->validate([
            'nombreCategoria' => 'required|string|max:255',
            'subrubros' => 'sometimes|array',
            'subrubros.*' => 'exists:subrubros,id',
        ]);

        $categoria->update($datos);

        if ($request->has('subrubros')) {
            $categoria->subrubros()->sync($request->subrubros);
        }

        return response()->json([
            'mensaje' => 'Categoría actualizada con éxito',
            'categoria' => $categoria->load('subrubros', 'productos')
        ]);
    }

    public function destroy($id)
    {
        $categoria = Categoria::findOrFail($id);
        
        $categoria->delete();

        return response()->json(['mensaje' => 'Categoría eliminada correctamente']);
    }
}