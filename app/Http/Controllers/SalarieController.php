<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class SalarieController extends Controller
{
    public function index()
    {
        return Inertia::render('salarie/Dashboard');

    }
}
