<?php


namespace App\Http\Controllers;

use App\Models\Projet;
use Inertia\Inertia;


class RessourcesHumainesController extends Controller
{
    public function index()
    {
        $projects = Projet::select('id', 'nom')->get();


        return Inertia::render('ressources-humaines/Dashboard',[
            'projects' => $projects,
        ]);

    }
    public function Maps()
    {
        $projects = Projet::select('id', 'nom')->get();

        return Inertia::render('ressources-humaines/Maps', [
            'projects' => $projects,
        ]);
    }

    public function Users()
    {
        $projects = Projet::select('id', 'nom')->get();

        return Inertia::render('ressources-humaines/Users', [
            'projects' => $projects,
        ]);
    }

//     public function menuProjects()
// {
//     $projects = Projet::select('id', 'nom')->get();

//     return Inertia::render('./components/nav-main.tsx', [
//         'projects' => $projects,
//     ]);
// }
}
