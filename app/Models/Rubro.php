<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Rubro extends Model
{
    protected $fillable = ['nombreRubro'];  

    public function subrubros()
    {
        return $this->hasMany(Subrubro::class);
    }

    public function productos()
    {
        return $this->hasMany(Producto::class);
    }
}