<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class RessourcesHumainesController extends Controller
{
    public function index()
    {
        return Inertia::render('ressources-humaines/Dashboard');

    }

        public function tracking()
    {
        return Inertia::render('ressources-humaines/Tracking');

    }
}
