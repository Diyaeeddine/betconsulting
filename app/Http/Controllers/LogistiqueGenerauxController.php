<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class LogistiqueGenerauxController extends Controller
{
    public function index()
    {
        return Inertia::render('logistique-generaux/Dashboard');

    }
}
