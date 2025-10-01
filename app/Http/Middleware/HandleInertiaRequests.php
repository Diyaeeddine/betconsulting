<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        // CRITIQUE: Changer la version force Inertia à recharger les données
        return parent::version($request) . '-' . (Auth::guard('salarie')->id() ?? Auth::guard('web')->id() ?? 'guest');
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $authData = null;
        $authType = null;
        
        // CRITIQUE: Vérifier l'ordre et s'assurer qu'un seul guard est actif
        if (Auth::guard('salarie')->check()) {
            $salarie = Auth::guard('salarie')->user();
            
            // Double vérification - si le guard web est aussi actif, le déconnecter
            if (Auth::guard('web')->check()) {
                Auth::guard('web')->logout();
            }
            
            $authType = 'salarie';
            $authData = [
                'id' => $salarie->id,
                'name' => $salarie->name,
                'email' => $salarie->email,
                'poste' => $salarie->poste ?? null,
                'nom_profil' => $salarie->nom_profil ?? null,
                'role' => $salarie->getRoleNames()->first(),
                'permissions' => $salarie->getAllPermissions()->pluck('name')->toArray(),
            ];
        } elseif (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();
            
            // Double vérification - si le guard salarie est aussi actif, le déconnecter
            if (Auth::guard('salarie')->check()) {
                Auth::guard('salarie')->logout();
            }
            
            $authType = 'user';
            $authData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $authData,
                'type' => $authType,
            ],
            'ziggy' => fn (): array => [
                ...(new \Tighten\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}