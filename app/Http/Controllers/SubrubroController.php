<?php

namespace App\Http\Controllers;

use App\Models\Subrubro;
use Illuminate\Http\Request;

class SubrubroController extends Controller
{
    public function index()
    {
        return response()->json(Subrubro::with('rubro', 'categorias')->get());
    }

    public function store(Request $request) 
    {
        $datos = $request->validate([
            'nombreSubrubro' => 'required|string|max:255', 
            'rubro_id' => 'required|exists:rubros,id'
        ]);
        
        return response()->json(Subrubro::create($datos), 201);
    }

    public function show($id)
    {
        $subrubro = Subrubro::with('rubro', 'categorias')->findOrFail($id);
        return response()->json($subrubro);
    }

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

    public function destroy($id)
    {
        $subrubro = Subrubro::findOrFail($id);
        $subrubro->delete();
        return response()->json(['mensaje' => 'Subrubro eliminado']);
    }
}