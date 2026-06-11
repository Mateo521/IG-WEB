<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    // Campos que se pueden asignar masivamente al crear o actualizar un producto
    protected $fillable = [
        'nombreProducto',
        'descripcion',
        'precio',
        'rutaImg',
        'rubro_id',
        'subrubro_id',
    ];

    // Cada producto pertenece a un rubro
    public function rubro()
    {
        return $this->belongsTo(Rubro::class);
    }

    // Cada producto pertenece a un subrubro
    public function subrubro()
    {
        return $this->belongsTo(Subrubro::class);
    }

    // Relacion muchos a muchos con categorias a traves de la tabla pivot categoria_producto
    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'categoria_producto');
    }

    // Un producto puede recibir muchas consultas de clientes
    public function consultas()
    {
        return $this->hasMany(Consulta::class);
    }
}
