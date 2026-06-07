<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consulta extends Model
{
    protected $fillable = [
        'nombreConsulta', 
        'email', 
        'mensaje', 
        'producto_id',
        'visto',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }
}