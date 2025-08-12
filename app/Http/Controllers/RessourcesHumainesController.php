<?php


namespace App\Http\Controllers;

use App\Models\Projet;
use Inertia\Inertia;

class RessourcesHumainesController extends Controller
{
    public function index()
    {
        return Inertia::render('ressources-humaines/Dashboard');

    }

    public function menuProjects()
    {
        $projects = Projet::select('id', 'nom')->get();

        return response()->json($projects);
    }
}
