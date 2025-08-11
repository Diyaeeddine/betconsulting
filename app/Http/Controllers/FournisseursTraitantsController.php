<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class FournisseursTraitantsController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboards/FournisseursTraitants');
    }
}
