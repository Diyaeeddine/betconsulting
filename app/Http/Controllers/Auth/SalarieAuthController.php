<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SalarieAuthController extends Controller
{
    public function showLoginForm()
    {
        return inertia('Auth/SalarieLogin');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Vérifier si le salarié existe et est accepté
        $salarie = \App\Models\Salarie::where('email', $credentials['email'])->first();

        if (!$salarie) {
            throw ValidationException::withMessages([
                'email' => 'Aucun compte ne correspond à cette adresse email.',
            ]);
        }

        if (!$salarie->is_accepted) {
            throw ValidationException::withMessages([
                'email' => 'Votre compte est en attente d\'approbation par un administrateur.',
            ]);
        }

        if ($salarie->statut !== 'actif') {
            throw ValidationException::withMessages([
                'email' => 'Votre compte est inactif. Veuillez contacter un administrateur.',
            ]);
        }

        if (Auth::guard('salarie')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended('/salarie/dashboard');
        }

        throw ValidationException::withMessages([
            'email' => 'Les identifiants fournis sont incorrects.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('salarie')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/salarie/login');
    }
}