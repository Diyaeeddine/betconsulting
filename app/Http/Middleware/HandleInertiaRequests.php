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
        return parent::version($request) . '-' . (Auth::guard('salarie')->id() ?? Auth::guard('web')->id() ?? 'guest');
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $authData = null;
        $authType = null;
        
        if (Auth::guard('salarie')->check()) {
            $salarie = Auth::guard('salarie')->user();
            
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