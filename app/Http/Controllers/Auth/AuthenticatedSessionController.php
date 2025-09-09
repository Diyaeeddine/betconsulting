<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
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
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Role-based redirect
        if ($user->hasRole('admin')) {
            return redirect()->route('dashboard.direction-generale');
        } elseif ($user->hasRole('communication-digitale')) {
            return redirect()->route('dashboard.communication-digitale');
        } elseif ($user->hasRole('etudes-techniques')) {
            return redirect()->route('dashboard.etudes-techniques');
        } elseif ($user->hasRole('financier-comptabilite')) {
            return redirect()->route('dashboard.financier-comptabilite');
        } elseif ($user->hasRole('fournisseurs-traitants')) {
            return redirect()->route('dashboard.fournisseurs-traitants');
        } elseif ($user->hasRole('innovation-transition')) {
            return redirect()->route('dashboard.innovation-transition');
        } elseif ($user->hasRole('juridique')) {
            return redirect()->route('dashboard.juridique');
        } elseif ($user->hasRole('logistique-generaux')) {
            return redirect()->route('dashboard.logistique-generaux');
        } elseif ($user->hasRole('marches-marketing')) {
            return redirect()->route('dashboard.marches-marketing');
        } elseif ($user->hasRole('qualite-audit')) {
            return redirect()->route('dashboard.qualite-audit');
        } elseif ($user->hasRole('ressources-humaines')) {
            return redirect()->route('dashboard.ressources-humaines');
        } elseif ($user->hasRole('suivi-controle')) {
            return redirect()->route('dashboard.suivi-controle');
        } elseif ($user->hasRole('salarie')) {
            return redirect()->route('dashboard.salarie');
        } else {
            return redirect('/dashboard');
        }
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
