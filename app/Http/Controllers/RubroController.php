<?php

namespace App\Http\Controllers;

use App\Models\Rubro;
use Illuminate\Http\Request;

class RubroController extends Controller
{
    public function index() 
    {
        return response()->json(Rubro::with('subrubros.categorias')->get());
    }

    public function store(Request $request) 
    {
        $datos = $request->validate([
            'nombreRubro' => 'required|string|max:255' 
        ]);
        
        return response()->json(Rubro::create($datos), 201);
    }

    public function show($id)
    {
        $rubro = Rubro::with('subrubros')->findOrFail($id);
        return response()->json($rubro);
    }

    public function update(Request $request, $id)
    {
        $rubro = Rubro::findOrFail($id);
        
        $datos = $request->validate([
            'nombreRubro' => 'required|string|max:255'
        ]);

        $rubro->update($datos);
        return response()->json(['mensaje' => 'Rubro actualizado', 'rubro' => $rubro]);
    }

    public function destroy($id)
    {
        $rubro = Rubro::findOrFail($id);
        $rubro->delete();
        return response()->json(['mensaje' => 'Rubro eliminado']);
    }
}