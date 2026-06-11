<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Subrubro extends Model
{
    // Campos que se pueden asignar masivamente al crear o actualizar un subrubro
    protected $fillable = ['nombreSubrubro', 'rubro_id'];

    // Cada subrubro pertenece a un rubro padre
    public function rubro()
    {
        return $this->belongsTo(Rubro::class);
    }

    // Relacion muchos a muchos con categorias a traves de la tabla pivot categoria_subrubro
    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'categoria_subrubro');
    }
}
