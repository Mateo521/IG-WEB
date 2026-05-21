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
            'categoria_id'   => 'required|exists:categorias,id', 
            'imagen'         => 'required|image|max:2048' 
        ];
    }
}