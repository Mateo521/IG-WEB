<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'admin123',
            'email' => 'admin@vitryo.com',
            'password' => Hash::make('admin123'),
            'is_admin' => true,
            'is_approved' => true,
        ]);
    }
}
