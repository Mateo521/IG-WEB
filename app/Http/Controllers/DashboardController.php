<?php

namespace App\Http\Controllers;

use App\Models\Rubro;
use App\Models\Subrubro;
use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Consulta;
use App\Models\User;

class DashboardController extends Controller
{
    // Devuelve los contadores de cada entidad para mostrarlos en las tarjetas del panel de administracion
    // Tambien incluye las 5 consultas mas recientes para que el admin las vea de un vistazo
    public function stats()
    {
        return response()->json([
            'rubros'          => Rubro::count(),
            'subrubros'       => Subrubro::count(),
            'usuarios'        => User::count(),
            'categorias'      => Categoria::count(),
            'productos'       => Producto::count(),
            'consultas'       => Consulta::count(),
            'consultas_nuevas'=> Consulta::where('visto', false)->count(),
            'ultimas_consultas'=> Consulta::with('producto')
                ->orderBy('id', 'desc')
                ->take(5)
                ->get(),
        ]);
    }
}
