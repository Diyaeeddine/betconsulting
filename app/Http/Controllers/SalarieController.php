<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class QualiteAuditController extends Controller
{
    public function index()
    {
        return Inertia::render('salarie/Dashboard');

    }
}
