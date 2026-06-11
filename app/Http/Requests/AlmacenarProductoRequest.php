<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AlmacenarProductoRequest extends FormRequest
{
    // Determinamos si el usuario esta autorizado a hacer esta peticion
    public function authorize(): bool
    {
        return true;
    }

    // Reglas de validacion que se aplican al crear o actualizar un producto
    public function rules(): array
    {
        return [
            'nombreProducto' => 'required|string|max:255',
            'descripcion'    => 'required|string',
            'precio'         => 'required|numeric|min:0',
            'rubro_id'       => 'required|exists:rubros,id',
            'subrubro_id'    => 'required|exists:subrubros,id',
            'categorias'     => 'required|array',
            'categorias.*'   => 'exists:categorias,id',
            'imagen'         => 'sometimes|image|max:2048',
        ];
    }
}
