<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    // Devuelve todas las categorias con sus subrubros y productos
    // Si recibe ?subrubro_id= X, filtra solo las categorias de ese subrubro
    public function index(Request $request)
    {
        $query = Categoria::with('subrubros', 'productos');

        if ($request->has('subrubro_id')) {
            $query->whereHas('subrubros', fn($q) => $q->where('subrubro_id', $request->subrubro_id));
        }

        return response()->json($query->get());
    }

    // Crea una categoria y la asocia a uno o mas subrubros mediante la tabla pivot
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

    // Muestra una categoria con sus subrubros y productos
    public function show($id)
    {
        $categoria = Categoria::with(['subrubros', 'productos'])->findOrFail($id);
        return response()->json($categoria);
    }

    // Actualiza una categoria y resincroniza sus subrubros si se enviaron
    public function update(Request $request, $id)
    {
        $categoria = Categoria::findOrFail($id);

        $datos = $request->validate([
            'nombreCategoria' => 'required|string|max:255',
            'subrubros' => 'sometimes|array',
            'subrubros.*' => 'exists:subrubros,id',
        ]);

        $categoria->update($datos);

        // Si nos pasaron subrubros, sincronizamos la relacion muchos a muchos
        // sync() reemplaza todos los registros pivot por los nuevos IDs
        if ($request->has('subrubros')) {
            $categoria->subrubros()->sync($request->subrubros);
        }

        return response()->json([
            'mensaje' => 'Categoría actualizada con éxito',
            'categoria' => $categoria->load('subrubros', 'productos')
        ]);
    }

    // Elimina una categoria de la base de datos
    public function destroy($id)
    {
        $categoria = Categoria::findOrFail($id);

        $categoria->delete();

        return response()->json(['mensaje' => 'Categoría eliminada correctamente']);
    }
}
