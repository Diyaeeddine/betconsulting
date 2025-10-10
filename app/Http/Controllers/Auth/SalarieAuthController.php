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
        // Forcer la déconnexion du guard web si actif
        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
            request()->session()->flush();
            request()->session()->regenerate();
        }
        
        return inertia('auth/SalarieLogin', [
            'status' => session('status'),
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

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

        // CRITIQUE: Déconnecter le guard web avant d'authentifier
        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
        }
        
        // Nettoyer complètement la session
        $request->session()->flush();

        if (Auth::guard('salarie')->attempt($credentials, $request->boolean('remember'))) {
    $request->session()->regenerate();
    return redirect()->route('salarie.profile');
}

        throw ValidationException::withMessages([
            'email' => 'Les identifiants fournis sont incorrects.',
        ]);
    }
}