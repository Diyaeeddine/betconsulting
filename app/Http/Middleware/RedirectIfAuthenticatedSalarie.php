<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticatedSalarie
{
    public function handle(Request $request, Closure $next, string $guard = 'salarie')
    {
        if (Auth::guard($guard)->check()) {
            return redirect()->route('salarie.dashboard');
        }

        return $next($request);
    }
}