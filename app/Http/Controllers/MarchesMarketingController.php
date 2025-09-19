<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use Inertia\Inertia;
use App\Models\Document;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MarchesMarketingController extends Controller
{
    public function index()
    {
        return Inertia::render('marches-marketing/Dashboard');
    }

    public function marches()
    {
        $projets = Projet::where('etape', 'first')->get();
        return Inertia::render('marches-marketing/Marches', ['projets' => $projets]);
    }

    public function show(Projet $projet)
    {
        return Inertia::render('marches-marketing/ProjetShow', [
            'projet' => $projet,
        ]);
    }

    
}