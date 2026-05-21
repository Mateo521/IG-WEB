<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Subrubro extends Model
{
    protected $fillable = ['nombreSubrubro', 'rubro_id'];

    public function rubro()
    {
        return $this->belongsTo(Rubro::class);
    }

    public function categorias()
    {
        return $this->hasMany(Categoria::class);  
    }
}