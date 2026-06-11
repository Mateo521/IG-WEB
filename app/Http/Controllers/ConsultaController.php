<?php

namespace App\Http\Controllers;

use App\Models\Consulta;
use Illuminate\Http\Request;

class ConsultaController extends Controller
{

    // Devuelve todas las consultas con el producto asociado, ordenadas de la mas reciente a la mas antigua
    public function index()
    {

        $consultas = Consulta::with('producto')->orderBy('id', 'desc')->get();
        return response()->json($consultas);
    }


    // Guarda una nueva consulta de un cliente sobre un producto
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

    // Muestra una consulta especifica con su producto
    public function show($id)
    {
        $consulta = Consulta::with('producto')->findOrFail($id);
        return response()->json($consulta);
    }

    // Actualiza los datos de una consulta existente
    public function update(Request $request, $id)
    {
        $consulta = Consulta::findOrFail($id);

        $datos = $request->validate([
            'nombreConsulta' => 'required|string|max:255',
            'email'          => 'required|email|max:255',
            'mensaje'        => 'required|string',
            'producto_id'    => 'required|exists:productos,id',
        ]);

        $consulta->update($datos);

        return response()->json([
            'mensaje'  => 'Consulta actualizada',
            'consulta' => $consulta,
        ]);
    }

    // Elimina una consulta de la base de datos
    public function destroy($id)
    {
        $consulta = Consulta::findOrFail($id);
        $consulta->delete();

        return response()->json(['mensaje' => 'Consulta eliminada']);
    }

    // Marca una consulta como leida (visto = true) para que el admin sepa que ya fue revisada
    public function marcarLeida($id)
    {
        $consulta = Consulta::findOrFail($id);
        $consulta->update(['visto' => true]);

        return response()->json(['mensaje' => 'Consulta marcada como leída']);
    }
}
