<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UniversalLogoutController extends Controller
{
public function destroy(Request $request)
{
    $isSalarie = Auth::guard('salarie')->check();
    
    Auth::guard('salarie')->logout();
    Auth::guard('web')->logout();
    
    $request->session()->flush();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    
    return $isSalarie 
        ? redirect()->route('salarie.login')
        : redirect()->route('login');
}
}