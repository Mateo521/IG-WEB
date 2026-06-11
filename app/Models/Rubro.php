<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Rubro extends Model
{
    // Campos que se pueden asignar masivamente al crear o actualizar un rubro
    protected $fillable = ['nombreRubro'];

    // Un rubro tiene muchos subrubros asociados
    public function subrubros()
    {
        return $this->hasMany(Subrubro::class);
    }

    // Un rubro puede tener muchos productos directamente
    public function productos()
    {
        return $this->hasMany(Producto::class);
    }
}
