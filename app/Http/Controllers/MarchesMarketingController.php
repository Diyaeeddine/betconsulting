<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class MarchesMarketingController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboards/MarchesMarketing');
    }
}
