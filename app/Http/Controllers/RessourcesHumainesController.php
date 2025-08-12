<?php


namespace App\Http\Controllers;

use App\Models\Projet;
use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

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

    public function getUser(Salarie $user)
    {
        return response()->json($user);
    }

   
    public function storeUsers(Request $request)
    {
        // Validate the incoming request data based on the salaries table schema.
        $validatedData = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'poste' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:salaries',
            'telephone' => 'required|string|max:20',
            'salaire_mensuel' => 'required|numeric',
            'date_embauche' => 'nullable|date',
        ]);

        // Create a new Salarie instance. The 'statut' field will default to 'actif' as per your schema.
        $salarie = Salarie::create($validatedData);

        // Return a JSON response with the new salary user and a success message.
        return response()->json([
            'message' => 'Salarie created successfully.',
            'salarie' => $salarie
        ], 201);
    }

    
    public function updateUser(Request $request, Salarie $salarie)
    {
        // Validate the incoming request data. The 'email' rule ignores the current user's email.
        $validatedData = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'poste' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('salaries')->ignore($salarie->id),
            ],
            'telephone' => 'required|string|max:20',
            'salaire_mensuel' => 'required|numeric',
            'date_embauche' => 'nullable|date',
            'statut' => 'required|in:actif,inactif',
        ]);

        // Update the salary user's attributes.
        $salarie->update($validatedData);

        // Return a JSON response with the updated salary user and a success message.
        return response()->json([
            'message' => 'Salarie updated successfully.',
            'salarie' => $salarie
        ]);
    }

    public function updateUserPass(Request $request, Salarie $user)
    {
        // Validate the incoming request data for the new password.
        $validatedData = $request->validate([
            'password' => 'required|string|min:8|confirmed', // 'confirmed' checks for 'password_confirmation' field
        ]);

        // Hash the new password and update the user's password.
        $user->password = Hash::make($validatedData['password']);
        $user->save();

        // Return a JSON response with a success message.
        return response()->json([
            'message' => 'User password updated successfully.'
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
