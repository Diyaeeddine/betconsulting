<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        // Forcer la déconnexion du guard salarie si actif
        if (Auth::guard('salarie')->check()) {
            Auth::guard('salarie')->logout();
            $request->session()->flush();
            $request->session()->regenerate();
        }
        
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // CRITIQUE: Déconnecter le guard salarie avant d'authentifier
        if (Auth::guard('salarie')->check()) {
            Auth::guard('salarie')->logout();
        }
        
        // Nettoyer complètement la session
        $request->session()->flush();
        
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Role-based redirect
        return match (true) {
            $user->hasRole('admin') => redirect()->route('dashboard.direction-generale'),
            $user->hasRole('communication-digitale') => redirect()->route('dashboard.communication-digitale'),
            $user->hasRole('etudes-techniques') => redirect()->route('dashboard.etudes-techniques'),
            $user->hasRole('financier-comptabilite') => redirect()->route('dashboard.financier-comptabilite'),
            $user->hasRole('fournisseurs-traitants') => redirect()->route('dashboard.fournisseurs-traitants'),
            $user->hasRole('innovation-transition') => redirect()->route('dashboard.innovation-transition'),
            $user->hasRole('juridique') => redirect()->route('dashboard.juridique'),
            $user->hasRole('logistique-generaux') => redirect()->route('dashboard.logistique-generaux'),
            $user->hasRole('marches-marketing') => redirect()->route('dashboard.marches-marketing'),
            $user->hasRole('qualite-audit') => redirect()->route('dashboard.qualite-audit'),
            $user->hasRole('ressources-humaines') => redirect()->route('dashboard.ressources-humaines'),
            $user->hasRole('suivi-controle') => redirect()->route('dashboard.suivi-controle'),
            $user->hasRole('salarie') => redirect()->route('salarie.profile'),
            default => redirect('/dashboard'),
        };
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}