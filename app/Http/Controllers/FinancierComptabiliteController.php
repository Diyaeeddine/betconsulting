<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class FinancierComptabiliteController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboards/FinancierComptabilite');
    }
}
