<?php

namespace App\Http\Controllers;

use App\Http\Requests\AlmacenarProductoRequest;
use App\Models\Producto;
use App\Models\Rubro;
use App\Models\Subrubro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $query = $this->queryFiltrada($request);

        // Si el admin pasa ?paginate=false devolvemos todo sin paginar
        // (útil para la tabla de admin donde no necesitamos paginación)
        if ($request->get('paginate') === 'false') {
            return response()->json($query->get());
        }

        // Para el catálogo público devolvemos resultados paginados
        // Limitamos por_pagina entre 1 y 50 para evitar abusos
        $porPagina = max(1, min(50, (int) $request->get('por_pagina', 12)));

        return response()->json($query->paginate($porPagina));
    }

    /*
     * exportar — genera y descarga un archivo CSV con los productos.
     *
     * Acepta los mismos filtros que index() para que el admin pueda
     * exportar solo lo que está viendo en pantalla.
     *
     * Formato del CSV:
     *   id, nombreProducto, descripcion, precio, rubro_id, rubro,
     *   subrubro_id, subrubro, categorias_ids, categorias_nombres
     *
     * Las categorías se separan con | dentro del campo (para no
     * confundirse con la coma del CSV).
     */
    public function exportar(Request $request)
    {
        // Reutilizamos la misma query que usa index() con sus filtros
        $productos     = $this->queryFiltrada($request)->get();
        $nombreArchivo = 'productos-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($productos) {
            // Abrimos stdout como stream para escribir el CSV directamente
            $stream = fopen('php://output', 'w');

            // BOM de UTF-8 para que Excel lo abra correctamente
            fputs($stream, "\xEF\xBB\xBF");

            // Hint para Excel: le decimos explícitamente que el separador es coma.
            // Sin esta línea, Excel en español mete todo en una sola columna porque
            // espera punto y coma por defecto.
            fputs($stream, "sep=,\n");

            // Fila de cabecera
            fputcsv($stream, [
                'id', 'nombreProducto', 'descripcion', 'precio',
                'rubro_id', 'rubro', 'subrubro_id', 'subrubro',
                'categorias_ids', 'categorias_nombres',
            ]);

            foreach ($productos as $p) {
                // Unimos las categorías con | para no romper el CSV con comas
                $idsCategoria      = $p->categorias->pluck('id')->join('|');
                $nombresCategoria  = $p->categorias->pluck('nombreCategoria')->join('|');

                fputcsv($stream, [
                    $p->id,
                    $p->nombreProducto,
                    $p->descripcion,
                    $p->precio,
                    $p->rubro_id,
                    $p->rubro?->nombreRubro      ?? '',
                    $p->subrubro_id,
                    $p->subrubro?->nombreSubrubro ?? '',
                    $idsCategoria,
                    $nombresCategoria,
                ]);
            }

            fclose($stream);

        }, $nombreArchivo, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$nombreArchivo}\"",
        ]);
    }

    /*
     * importar — lee un archivo CSV y crea los productos en la BD.
     *
     * Formato esperado del CSV (primera fila = cabecera, se ignora):
     *   nombreProducto, descripcion, precio, rubro_id, subrubro_id, categorias
     *
     * La columna "categorias" es opcional y acepta IDs separados con |
     * Ejemplo de fila: "Producto","Descripcion",1500.00,1,2,3|4
     *
     * Si una fila falla se registra el error y se continúa con la siguiente.
     * Al final se devuelve cuántos se crearon y la lista de errores.
     */
    public function importar(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $archivo = $request->file('archivo');
        $stream  = fopen($archivo->getRealPath(), 'r');

        $creados          = 0;     // filas que se crearon con éxito
        $errores          = [];    // lista de [ fila => N, motivo => "..." ]
        $numFila          = 0;     // número de fila física en el archivo
        $encabezadoListo  = false; // true cuando ya salteamos la fila de cabecera

        // Cargamos todos los IDs válidos de rubro y subrubro en arrays
        // para no hacer una consulta a la BD por cada fila del CSV
        $rubrosValidos    = Rubro::pluck('id')->flip()->toArray();
        $subrubrosValidos = Subrubro::pluck('id')->flip()->toArray();

        while (($fila = fgetcsv($stream)) !== false) {
            $numFila++;

            // Si la primera línea es "sep=," (hint que agregamos para Excel) la salteamos
            // y seguimos sin marcar el encabezado como listo todavía
            if ($numFila === 1 && isset($fila[0]) && str_starts_with(trim($fila[0]), 'sep=')) {
                continue;
            }

            // La primera fila real (después del sep= si lo había) es la cabecera — la salteamos
            if (!$encabezadoListo) {
                $encabezadoListo = true;
                continue;
            }

            // Saltamos filas que están completamente vacías
            if (empty(array_filter($fila))) continue;

            // Necesitamos al menos 5 columnas
            if (count($fila) < 5) {
                $errores[] = [
                    'fila'   => $numFila,
                    'motivo' => 'Faltan columnas (mínimo 5: nombreProducto, descripcion, precio, rubro_id, subrubro_id)',
                ];
                continue;
            }

            // Desempaquetamos las columnas y limpiamos espacios
            [$nombreProducto, $descripcion, $precio, $rubro_id, $subrubro_id] = array_map('trim', $fila);
            $categorias_raw = trim($fila[5] ?? ''); // sexta columna, opcional

            // Validamos que el precio sea un número positivo
            if (!is_numeric($precio) || (float) $precio < 0) {
                $errores[] = ['fila' => $numFila, 'motivo' => "Precio inválido: \"{$precio}\""];
                continue;
            }

            // Verificamos que el rubro_id exista (usando el array en memoria, no consulta)
            if (!isset($rubrosValidos[(int) $rubro_id])) {
                $errores[] = ['fila' => $numFila, 'motivo' => "rubro_id \"{$rubro_id}\" no existe"];
                continue;
            }

            // Verificamos que el subrubro_id exista
            if (!isset($subrubrosValidos[(int) $subrubro_id])) {
                $errores[] = ['fila' => $numFila, 'motivo' => "subrubro_id \"{$subrubro_id}\" no existe"];
                continue;
            }

            // Creamos el producto
            $producto = Producto::create([
                'nombreProducto' => $nombreProducto,
                'descripcion'    => $descripcion,
                'precio'         => (float) $precio,
                'rubro_id'       => (int)   $rubro_id,
                'subrubro_id'    => (int)   $subrubro_id,
            ]);

            // Adjuntamos categorías si se proporcionaron (separadas por |)
            if ($categorias_raw !== '') {
                $ids = array_filter(array_map('intval', explode('|', $categorias_raw)));
                if (!empty($ids)) {
                    $producto->categorias()->attach($ids);
                }
            }

            $creados++;
        }

        fclose($stream);

        $cantErrores = count($errores);

        return response()->json([
            'mensaje' => "{$creados} producto(s) importado(s)" . ($cantErrores > 0 ? ", {$cantErrores} fila(s) con error" : ''),
            'creados' => $creados,
            'errores' => $errores,
        ], 201);
    }

    public function store(AlmacenarProductoRequest $request)
    {
        $datos = $request->validated();

        if ($request->hasFile('imagen')) {
            $imagen = $request->file('imagen');
            $nombre = time() . '_' . $imagen->getClientOriginalName();
            $ruta = $imagen->storeAs('productos', $nombre, 'public');

            if (class_exists(\Intervention\Image\Laravel\Facades\Image::class)) {
                $this->comprimirImagen(storage_path('app/public/' . $ruta));
            }

            $datos['rutaImg'] = $ruta;
            unset($datos['imagen']);
        }

        $categorias = $datos['categorias'] ?? [];
        unset($datos['categorias']);

        $producto = Producto::create($datos);

        if (!empty($categorias)) {
            $producto->categorias()->attach($categorias);
        }

        $producto->load('rubro', 'subrubro', 'categorias');

        return response()->json([
            'mensaje'  => 'Producto creado con éxito',
            'producto' => $producto
        ], 201);
    }

    public function show($id)
    {
        $producto = Producto::with('rubro', 'subrubro', 'categorias')->findOrFail($id);
        return response()->json($producto);
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);

        $datos = $request->validate([
            'nombreProducto' => 'required|string|max:255',
            'descripcion'    => 'required|string',
            'precio'         => 'required|numeric|min:0',
            'rubro_id'       => 'required|exists:rubros,id',
            'subrubro_id'    => 'required|exists:subrubros,id',
            'categorias'     => 'required|array',
            'categorias.*'   => 'exists:categorias,id',
            'imagen'         => 'sometimes|image|max:2048',
        ]);

        if ($request->hasFile('imagen')) {
            if ($producto->rutaImg) {
                Storage::disk('public')->delete($producto->rutaImg);
            }

            $imagen = $request->file('imagen');
            $nombre = time() . '_' . $imagen->getClientOriginalName();
            $datos['rutaImg'] = $imagen->storeAs('productos', $nombre, 'public');

            if (class_exists(\Intervention\Image\Laravel\Facades\Image::class)) {
                $this->comprimirImagen(storage_path('app/public/' . $datos['rutaImg']));
            }
        }

        $categorias = $datos['categorias'] ?? [];
        unset($datos['categorias']);

        $producto->update($datos);

        if (!empty($categorias)) {
            $producto->categorias()->sync($categorias);
        }

        $producto->load('rubro', 'subrubro', 'categorias');

        return response()->json([
            'mensaje'  => 'Producto actualizado',
            'producto' => $producto
        ]);
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);

        if ($producto->rutaImg) {
            Storage::disk('public')->delete($producto->rutaImg);
        }

        $producto->categorias()->detach();
        $producto->delete();

        return response()->json(['mensaje' => 'Producto eliminado correctamente']);
    }

    /*
     * queryFiltrada — arma la query de productos con todos los filtros opcionales.
     *
     * La extraemos en un método privado para que tanto index() como exportar()
     * usen exactamente la misma lógica sin repetir código.
     */
    private function queryFiltrada(Request $request)
    {
        $query = Producto::with('rubro', 'subrubro', 'categorias');

        // Búsqueda por nombre o descripción
        if ($request->filled('search')) {
            $busqueda = $request->search;
            $query->where(function ($q) use ($busqueda) {
                $q->where('nombreProducto', 'like', "%{$busqueda}%")
                  ->orWhere('descripcion',   'like', "%{$busqueda}%");
            });
        }

        // Filtros por FK directas
        if ($request->filled('rubro_id'))    $query->where('rubro_id',    $request->rubro_id);
        if ($request->filled('subrubro_id')) $query->where('subrubro_id', $request->subrubro_id);

        // Filtro por categoría (pivot M:N)
        if ($request->filled('categoria_id')) {
            $idCategoria = $request->categoria_id;
            $query->whereHas('categorias', fn($q) => $q->where('categorias.id', $idCategoria));
        }

        // Rango de precio
        if ($request->filled('precio_min')) $query->where('precio', '>=', $request->precio_min);
        if ($request->filled('precio_max')) $query->where('precio', '<=', $request->precio_max);

        // Ordenamiento — por defecto más recientes primero
        switch ($request->get('sort', 'reciente')) {
            case 'precio_asc':  $query->orderBy('precio',         'asc');  break;
            case 'precio_desc': $query->orderBy('precio',         'desc'); break;
            case 'nombre_asc':  $query->orderBy('nombreProducto', 'asc');  break;
            default:            $query->orderBy('id',             'desc');  break;
        }

        return $query;
    }

    private function comprimirImagen(string $fullPath): void
    {
        try {
            $img = \Intervention\Image\Laravel\Facades\Image::read($fullPath);
            $img->scaleDown(width: 800);
            $img->save(null, 75);
        } catch (\Throwable) {
            try {
                $img = \Intervention\Image\Laravel\Facades\Image::make($fullPath);
                $img->resize(800, null, function ($c) { $c->aspectRatio(); });
                $img->save(null, 75);
            } catch (\Throwable) {
            }
        }
    }
}
