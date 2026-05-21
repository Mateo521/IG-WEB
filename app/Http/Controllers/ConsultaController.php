<?php

namespace App\Http\Controllers;

use App\Models\Consulta;
use Illuminate\Http\Request;

class ConsultaController extends Controller
{

    public function index() 
    {

        $consultas = Consulta::with('producto')->orderBy('id', 'desc')->get();
        return response()->json($consultas);
    }


    public function store(Request $request) 
    {
        $datos = $request->validate([
            'nombreConsulta' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'mensaje' => 'required|string',
            'producto_id' => 'required|exists:productos,id'
        ]);

        $consulta = Consulta::create($datos);

        /*envio de mail pendiente*/

        return response()->json([
            'mensaje' => 'Consulta guardada con éxito',
            'consulta' => $consulta
        ], 201);
    }
}