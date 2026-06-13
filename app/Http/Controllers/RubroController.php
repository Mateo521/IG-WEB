<?php

namespace App\Http\Controllers;

use App\Models\Rubro;
use Illuminate\Http\Request;

class RubroController extends Controller
{
    // Devuelve todos los rubros con sus subrubros y categorias anidadas (carga ansiosa)
    public function index()
    {
        return response()->json(Rubro::with('subrubros.categorias')->get());
    }

    // Crea un nuevo rubro con el nombre validado
    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombreRubro' => 'required|string|max:255'
        ]);

        return response()->json(Rubro::create($datos), 201);
    }

    // Muestra un rubro especifico con sus subrubros
    public function show($id)
    {
        $rubro = Rubro::with('subrubros')->findOrFail($id);
        return response()->json($rubro);
    }

    // Actualiza el nombre de un rubro existente
    public function update(Request $request, $id)
    {
        $rubro = Rubro::findOrFail($id);

        $datos = $request->validate([
            'nombreRubro' => 'required|string|max:255'
        ]);

        $rubro->update($datos);
        return response()->json(['mensaje' => 'Rubro actualizado', 'rubro' => $rubro]);
    }

    // Elimina un rubro de la base de datos
    public function destroy($id)
    {
        $rubro = Rubro::findOrFail($id);
        $rubro->delete();
        return response()->json(['mensaje' => 'Rubro eliminado']);
    }
}
