<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $fillable = ['nombreCategoria'];

    public function subrubros()
    {
        return $this->belongsToMany(Subrubro::class, 'categoria_subrubro');
    }

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'categoria_producto');
    }
}