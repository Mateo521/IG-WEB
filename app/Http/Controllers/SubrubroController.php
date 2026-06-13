<?php

namespace App\Http\Controllers;

use App\Models\Subrubro;
use Illuminate\Http\Request;

class SubrubroController extends Controller
{
    // Devuelve todos los subrubros con su rubro padre y categorias asociadas
    public function index()
    {
        return response()->json(Subrubro::with('rubro', 'categorias')->get());
    }

    // Crea un nuevo subrubro validando el nombre y que el rubro padre exista
    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombreSubrubro' => 'required|string|max:255',
            'rubro_id' => 'required|exists:rubros,id'
        ]);

        return response()->json(Subrubro::create($datos), 201);
    }

    // Muestra un subrubro especifico con su rubro y categorias
    public function show($id)
    {
        $subrubro = Subrubro::with('rubro', 'categorias')->findOrFail($id);
        return response()->json($subrubro);
    }

    // Actualiza los datos de un subrubro. El rubro_id es opcional en actualizacion
    public function update(Request $request, $id)
    {
        $subrubro = Subrubro::findOrFail($id);

        $datos = $request->validate([
            'nombreSubrubro' => 'required|string|max:255',
            'rubro_id' => 'sometimes|exists:rubros,id'
        ]);

        $subrubro->update($datos);
        return response()->json(['mensaje' => 'Subrubro actualizado', 'subrubro' => $subrubro]);
    }

    // Elimina un subrubro de la base de datos
    public function destroy($id)
    {
        $subrubro = Subrubro::findOrFail($id);
        $subrubro->delete();
        return response()->json(['mensaje' => 'Subrubro eliminado']);
    }
}
