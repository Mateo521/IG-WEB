<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function pendientes()
    {
        $usuarios = User::where('is_approved', false)
            ->where('is_admin', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($usuarios);
    }

    public function aprobar(User $user)
    {
        if ($user->is_admin) {
            throw ValidationException::withMessages([
                'user' => ['No puedes modificar un administrador.'],
            ]);
        }

        $user->update(['is_approved' => true]);

        return response()->json([
            'message' => 'Usuario aprobado correctamente.',
            'user' => $user,
        ]);
    }

    public function rechazar(User $user)
    {
        if ($user->is_admin) {
            throw ValidationException::withMessages([
                'user' => ['No puedes modificar un administrador.'],
            ]);
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuario rechazado y eliminado correctamente.',
        ]);
    }

    public function index()
    {
        $usuarios = User::orderBy('created_at', 'desc')->get();
        return response()->json($usuarios);
    }
}
