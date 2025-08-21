<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class SuiviControleController extends Controller
{
    public function index()
    {
        return Inertia::render('suivi-controle/Dashboard');

    }
}
