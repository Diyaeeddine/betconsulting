<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DirectionGeneraleController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboards/DirectionGenerale');
    }

}
