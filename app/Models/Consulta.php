<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consulta extends Model
{
    // Campos que se pueden asignar masivamente al crear o actualizar una consulta
    protected $fillable = [
        'nombreConsulta',
        'email',
        'mensaje',
        'producto_id',
        'visto',
    ];

    // Cada consulta esta asociada a un producto en particular
    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }
}
