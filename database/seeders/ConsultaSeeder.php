<?php

namespace Database\Seeders;

use App\Models\Consulta;
use Illuminate\Database\Seeder;

class ConsultaSeeder extends Seeder
{
    public function run(): void
    {
        Consulta::create([
            'nombreConsulta' => 'Consulta 1',
            'email' => 'cliente1@test.com',
            'mensaje' => 'Consulta de prueba número 1.',
            'producto_id' => 1,
        ]);

        Consulta::create([
            'nombreConsulta' => 'Consulta 2',
            'email' => 'cliente2@test.com',
            'mensaje' => 'Consulta de prueba número 2.',
            'producto_id' => 3,
        ]);

        Consulta::create([
            'nombreConsulta' => 'Consulta 3',
            'email' => 'cliente3@test.com',
            'mensaje' => 'Consulta de prueba número 3.',
            'producto_id' => 5,
        ]);

        Consulta::create([
            'nombreConsulta' => 'Consulta 4',
            'email' => 'cliente4@test.com',
            'mensaje' => 'Consulta de prueba número 4.',
            'producto_id' => 10,
        ]);

        Consulta::create([
            'nombreConsulta' => 'Consulta 5',
            'email' => 'cliente5@test.com',
            'mensaje' => 'Consulta de prueba número 5.',
            'producto_id' => 15,
        ]);

        Consulta::create([
            'nombreConsulta' => 'Consulta 6',
            'email' => 'cliente6@test.com',
            'mensaje' => 'Consulta de prueba número 6.',
            'producto_id' => 20,
        ]);
    }
}
