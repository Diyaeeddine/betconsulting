<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class InnovationTransitionController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboards/InnovationTransition');
    }
}
