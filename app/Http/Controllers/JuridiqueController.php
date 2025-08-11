<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class JuridiqueController extends Controller
{
    public function index()
    {
        // return Inertia::render('dashboards/Juridique');
        return Inertia::render('juridique/Dashboard');

    }
}
