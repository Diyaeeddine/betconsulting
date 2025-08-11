<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class CommunicationDigitaleController extends Controller
{
    public function index()
    {
        return Inertia::render('communication-digitale/Dashboard');
    }
}
