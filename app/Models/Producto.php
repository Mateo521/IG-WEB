<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $fillable = [
        'nombreProducto',
        'descripcion',
        'precio',
        'rutaImg',
        'rubro_id',
        'subrubro_id',
    ];

    public function rubro()
    {
        return $this->belongsTo(Rubro::class);
    }

    public function subrubro()
    {
        return $this->belongsTo(Subrubro::class);
    }

    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'categoria_producto');
    }

    public function consultas()
    {
        return $this->hasMany(Consulta::class);
    }
}