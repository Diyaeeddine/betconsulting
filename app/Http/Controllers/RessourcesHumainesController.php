<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class RessourcesHumainesController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboards/RessourcesHumaines');
    }
}
