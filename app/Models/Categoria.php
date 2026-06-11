<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    // Campos que se pueden asignar masivamente al crear o actualizar una categoria
    protected $fillable = ['nombreCategoria'];

    // Relacion muchos a muchos con subrubros a traves de la tabla pivot categoria_subrubro
    public function subrubros()
    {
        return $this->belongsToMany(Subrubro::class, 'categoria_subrubro');
    }

    // Relacion muchos a muchos con productos a traves de la tabla pivot categoria_producto
    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'categoria_producto');
    }
}
