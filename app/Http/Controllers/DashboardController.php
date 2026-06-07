<?php

namespace App\Http\Controllers;

use App\Models\Rubro;
use App\Models\Subrubro;
use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Consulta;

class DashboardController extends Controller
{
    /*
     * stats — devuelve los contadores de cada entidad para el panel admin.
     *
     * Solo hace un COUNT por tabla, nada de joins ni relaciones.
     * El frontend lo usa para mostrar números reales en las tarjetas
     * del dashboard en lugar del texto "PRÓXIMAMENTE CONSULTAS".
     */
    public function stats()
    {
        return response()->json([
            'rubros'          => Rubro::count(),
            'subrubros'       => Subrubro::count(),
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
