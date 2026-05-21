<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $fillable = ['nombreCategoria', 'subrubro_id'];

    public function subrubro()
    {
        return $this->belongsTo(Subrubro::class);
    }

    public function productos()
    {
        return $this->hasMany(Producto::class);
    }
}