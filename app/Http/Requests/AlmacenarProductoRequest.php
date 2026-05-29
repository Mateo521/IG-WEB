<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AlmacenarProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

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