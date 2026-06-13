<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Registra un nuevo usuario, valida los datos, lo crea y le devuelve un token de acceso
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_approved' => false,
            'is_admin' => false,
        ]);

        return response()->json([
            'message' => 'Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.',
            'user' => $user,
        ], 201);
    }

    // Inicia sesion: busca al usuario por email, verifica la contrasena y devuelve un token
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        // Si el usuario no existe o la contrasena no coincide, lanzamos un error de validacion
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Verificar si el usuario está aprobado por el admin
        if (!$user->is_approved) {
            throw ValidationException::withMessages([
                'email' => ['Tu cuenta está pendiente de aprobación por un administrador.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Cierra la sesion eliminando el token que el usuario esta usando en esta peticion
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['mensaje' => 'Sesión cerrada correctamente']);
    }
}
