<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Auth;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        Inertia::share([
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error' => session('error'),
                ];
            },
            'auth.user.permissions' => function () {
                return auth()->user() 
                    ? auth()->user()->getAllPermissions()->pluck('name')->toArray() 
                    : [];
            },
            'notifications' => fn () => Auth::check()
            ? Auth::user()->unreadNotifications()->take(5)->get()
            : [],
        
        ]);
            Broadcast::routes();
        
        if (file_exists(base_path('routes/channels.php'))) {
            require base_path('routes/channels.php');
        }
    }
}