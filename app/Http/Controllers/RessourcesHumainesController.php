<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use App\Models\Profil;
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

    public function Users()
    {
        // Auth + role checks...
        if (!Auth::check()) {
            return redirect('/');
        }
        $user = Auth::user();
        if (!$user->hasRole('ressources-humaines') && !$user->hasRole('admin')) {
            abort(403, 'You do not have permission to view this page.');
        }

        // Get all projects (basic data)
        $projects = Projet::select('id', 'nom')->get();

        // Get all salaries with their profiles
        $users = Salarie::with('profils')->get();

        // Add projects_count attribute to each user
        $users->transform(function ($user) {
            $projectIds = $user->projet_ids;
            
            // Handle different data types for projet_ids
            if (is_string($projectIds)) {
                $projectIds = json_decode($projectIds, true) ?? [];
            } elseif (!is_array($projectIds)) {
                $projectIds = [];
            }
            
            $user->projects_count = count($projectIds);
            return $user;
        });

        // Hide sensitive fields if needed
        $users->makeHidden(['password']);

        if (request()->wantsJson()) {
            return response()->json([
                'projects' => $projects,
                'users' => $users,
            ]);
        }

        return Inertia::render('ressources-humaines/Users', [
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    public function getUserProjects(Salarie $salarie)
    {
        // Auth + role checks...
        if (!Auth::check()) {
            return redirect('/');
        }
        $user = Auth::user();
        if (!$user->hasRole('ressources-humaines') && !$user->hasRole('admin')) {
            abort(403, 'You do not have permission to view this page.');
        }

        $projetIds = $salarie->projet_ids ?? [];

        if (empty($projetIds)) {
            return response()->json(['message' => 'No projects found for this salarie'], 404);
        }

        $projects = Projet::whereIn('id', $projetIds)->get();

        return response()->json($projects);
    }

    public function getProjetSalaries(Projet $projet)
    {
        // Auth + role checks...
        if (!Auth::check()) {
            return redirect('/');
        }
        $user = Auth::user();
        if (!$user->hasRole('ressources-humaines') && !$user->hasRole('admin')) {
            abort(403, 'You do not have permission to view this page.');
        }

        $salarieIds = $projet->salarie_ids ?? [];

        if (empty($salarieIds)) {
            return response()->json(['message' => 'No salaries found for this projet'], 404);
        }

        $salaries = Salarie::whereIn('id', $salarieIds)->get();

        return response()->json($salaries);
    }

    public function getProjects()
    {
        // Auth + role checks...
        if (!Auth::check()) {
            return redirect('/');
        }
        $user = Auth::user();
        if (!$user->hasRole('ressources-humaines') && !$user->hasRole('admin')) {
            abort(403, 'You do not have permission to view this page.');
        }

        $projects = Projet::all();

        if (empty($projects)) {
            return response()->json(['message' => 'No projects found for this salarie'], 404);
        }

        return response()->json($projects);
    }

    public function getUser(Salarie $user)
    {   
        return response()->json($user);
    }

    public function storeUsers(Request $request)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:salaries',
            'telephone' => 'required|string|max:20',
            'salaire_mensuel' => 'required|numeric',
            'date_embauche' => 'nullable|date',
            // Profile validation
            'nom_profil' => 'required|in:bureau_etudes,construction,suivi_controle,support_gestion',
            'poste_profil' => 'required|string|max:255',
        ]);

        try {
            // Create the salary record
            $salarie = Salarie::create([
                'nom' => $validatedData['nom'],
                'prenom' => $validatedData['prenom'],
                'email' => $validatedData['email'],
                'telephone' => $validatedData['telephone'],
                'salaire_mensuel' => $validatedData['salaire_mensuel'],
                'date_embauche' => $validatedData['date_embauche'],
                'statut' => 'actif',
                'projet_ids' => json_encode([]), // Initialize empty project array
            ]);

            // Create the profile record
            Profil::create([
                'user_id' => $salarie->id,
                'nom_profil' => $validatedData['nom_profil'],
                'poste_profil' => $validatedData['poste_profil'],
            ]);

            return back()->with('success', 'Employé créé avec succès.');
        } catch (\Exception $e) {
            Log::error('Error creating user: ' . $e->getMessage());
            return back()->with('error', 'Erreur lors de la création de l\'employé.');
        }
    }

    public function affecteGrantUser(Request $request, Salarie $salarie)
    {
        $request->validate([
            'projet_id' => 'required|integer|exists:projets,id',
            'enable' => 'required|boolean',
        ]);

        try {
            $projet = Projet::findOrFail($request->projet_id);

            // Get current arrays
            $projetSalarieIds = $projet->salarie_ids ?? [];
            $salarieProjetIds = $salarie->projet_ids;
            
            // Handle different data types for salarie projet_ids
            if (is_string($salarieProjetIds)) {
                $salarieProjetIds = json_decode($salarieProjetIds, true) ?? [];
            } elseif (!is_array($salarieProjetIds)) {
                $salarieProjetIds = [];
            }

            if ($request->enable) {
                // Add user to project if not present
                if (!in_array($salarie->id, $projetSalarieIds)) {
                    $projetSalarieIds[] = $salarie->id;
                }
                // Add project to user if not present
                if (!in_array($projet->id, $salarieProjetIds)) {
                    $salarieProjetIds[] = $projet->id;
                }
            } else {
                // Remove user from project
                $projetSalarieIds = array_values(array_filter($projetSalarieIds, fn($id) => $id !== $salarie->id));
                // Remove project from user
                $salarieProjetIds = array_values(array_filter($salarieProjetIds, fn($id) => $id !== $projet->id));
            }

            // Update both records
            $projet->salarie_ids = $projetSalarieIds;
            $projet->save();

            $salarie->projet_ids = json_encode($salarieProjetIds);
            $salarie->save();

            return back()->with('success', 'Affectation mise à jour avec succès.');
        } catch (\Exception $e) {
            Log::error('Error updating project assignment: ' . $e->getMessage());
            return back()->with('error', 'Erreur lors de la mise à jour de l\'affectation.');
        }
    }

    public function enableDisableUser(Salarie $salarie)
    {
        if (!Auth::check()) {
            Log::warning('User not authenticated, redirecting to login');
            return redirect('/');
        }

        $user = Auth::user();

        if (!$user->hasRole('ressources-humaines') && !$user->hasRole('admin')) {
            Log::warning("Access denied for user {$user->email} - insufficient role");
            abort(403, 'You do not have permission to view this page.');
        }

        try {
            if ($salarie->statut === 'actif') {
                $salarie->statut = 'inactif';

                // Remove user from all projects
                $projets = Projet::whereJsonContains('salarie_ids', $salarie->id)->get();

                foreach ($projets as $projet) {
                    $salarieIds = $projet->salarie_ids;
                    $filteredIds = array_filter($salarieIds, fn($id) => $id !== $salarie->id);
                    $projet->salarie_ids = array_values($filteredIds);
                    $projet->save();
                }

                // Clear user's project assignments
                $salarie->projet_ids = json_encode([]);
            } else {
                $salarie->statut = 'actif';
            }

            $salarie->save();

            return back()->with('success', 'Le statut du salarié a été mis à jour.');
        } catch (\Exception $e) {
            Log::error('Error updating user status: ' . $e->getMessage());
            return back()->with('error', 'Erreur lors de la mise à jour du statut.');
        }
    }

    public function updateUserPass(Request $request, Salarie $salarie)
    {
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

        // Validate the incoming request data for the new password
        $validatedData = $request->validate([
            'new_password' => 'required|string|min:8|confirmed', // Looks for 'new_password_confirmation'
        ]);

        try {
            // Hash the new password and update the user's password
            $salarie->password = Hash::make($validatedData['new_password']);
            $salarie->save();

            return back()->with('success', 'Mot de passe mis à jour avec succès.');
        } catch (\Exception $e) {
            Log::error('Error updating password: ' . $e->getMessage());
            return back()->with('error', 'Erreur lors de la mise à jour du mot de passe.');
        }
    }
}
