<?php


namespace App\Http\Controllers;

use App\Models\Projet;
use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Salarie;


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

    // public function getSalaries()
    // {
    //     Log::info('getUsers method called');

    //     // Authentication check (default web guard)
    //     if (!Auth::check()) {
    //         Log::warning('User not authenticated, redirecting to login');
    //         return redirect('/');
    //     }

    //     $user = Auth::user();

    //     Log::info('User authenticated', [
    //         'userId' => $user->id,
    //         'email' => $user->email,
    //         'roles' => $user->getRoleNames()->toArray()
    //     ]);

    //     // Authorization check - only RH or Admin can view
    //     if (!$user->hasRole('ressources-humaines') && !$user->hasRole('admin')) {
    //         Log::warning("Access denied for user {$user->email} - insufficient role");
    //         abort(403, 'You do not have permission to view this page.');
    //     }

    //     // If RH role → show all users, else only own users
    //     if ($user->hasRole('ressources-humaines')) {
    //         $users = Salarie::all();
    //     } else {
    //         $users = Salarie::where('id_admin', $user->id)->get();
    //     }

    //     // Hide sensitive fields
    //     $users->makeHidden(['password']);

    //     Log::info('Users fetched', [
    //         'count' => $users->count(),
    //         'sample' => $users->take(3)->toArray()
    //     ]);

    //     // Return to Inertia view
    //     // return Inertia::render('ressources-humaines/Users', [
    //     //     'users' => $users->toArray(),
    //     // ]);

    //     if (request()->wantsJson() || request()->expectsJson()) {
    //         return response()->json([
    //             'status' => 'success',
    //             'users' => $users->toArray(),
    //         ]);
    //         }

    //     return Inertia::render('ressources-humaines/Users', [
    //         'users' => $users->toArray(),
    //     ]);
    // }

    public function Users()
{
    // Fetch all projects (for dropdowns etc.)
    $projects = Projet::select('id', 'nom')->get();

    // Authentication check
    if (!Auth::check()) {
        Log::warning('User not authenticated, redirecting to login');
        return redirect('/');
    }

    $user = Auth::user();

    // Role check
    if (!$user->hasRole('ressources-humaines') && !$user->hasRole('admin')) {
        Log::warning("Access denied for user {$user->email} - insufficient role");
        abort(403, 'You do not have permission to view this page.');
    }

    // Retrieve users with related project names
    if ($user->hasRole('ressources-humaines')) {
        $users = Salarie::with('project:id,nom,statut')->get();
    } else {
        $users = Salarie::with('project:id,nom')
            ->where('id_admin', $user->id)
            ->get();
    }

    // Hide sensitive fields
    $users->makeHidden(['password']);

    if (request()->wantsJson()) {
        return response()->json([
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    // Otherwise, return Inertia HTML response
    return Inertia::render('ressources-humaines/Users', [
        'projects' => $projects,
        'users' => $users,
    ]);
}


    public function getUserProjects(Salarie $salarie)
    {
        $project = $salarie->project;
        return response()->json($project);
    }


    



//     public function menuProjects()
// {
//     $projects = Projet::select('id', 'nom')->get();

//     return Inertia::render('./components/nav-main.tsx', [
//         'projects' => $projects,
//     ]);
// }
}
