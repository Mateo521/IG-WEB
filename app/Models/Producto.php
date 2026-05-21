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
        'categoria_id'  
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function consultas()
    {
        return $this->hasMany(Consulta::class);
    }
}