<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class EtudesTechniquesController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboards/EtudesTechniques');
    }
}
