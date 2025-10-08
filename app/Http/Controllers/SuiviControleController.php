<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Salarie;
use App\Models\Terrain;
use App\Models\Projet;
use App\Models\Vehicule;
use App\Models\Profil;
use App\Models\plan;
use App\Models\Document;
use Illuminate\Support\Facades\Validator;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

use App\Models\WsTechData;
use App\Events\WsTechDataReceived;



class SuiviControleController extends Controller
{
    public function index()
    {
        return Inertia::render('suivi-controle/Dashboard');

    }


     public function Terrains()
{
    // Get projects with users relationships
    $projects = Projet::with(['users', 'responsable'])->get()->map(function ($projet) {
        return [
            'id' => $projet->id,
            'nom' => $projet->nom,
            'description' => $projet->description,
            'budget_total' => $projet->budget_total,
            'budget_utilise' => $projet->budget_utilise,
            'date_debut' => $projet->date_debut,
            'date_fin' => $projet->date_fin,
            'statut' => $projet->statut,
            'client' => $projet->client,
            'lieu_realisation' => $projet->lieu_realisation,
            'responsable_id' => $projet->responsable_id,
            'type_projet' => $projet->type_projet,
            'latitude' => $projet->latitude,
            'longitude' => $projet->longitude,
            'radius' => $projet->radius,
            'terrain_ids' => is_array($projet->terrain_ids) ? $projet->terrain_ids : [],
            // Get user IDs from pivot table
            'user_ids' => $projet->users->pluck('id')->toArray(),
            'users_count' => $projet->users->count(),
        ];
    });

    // Get terrains with project info
    $terrains = Terrain::with('projet')->get()->map(function ($terrain) {
        return [
            'id' => $terrain->id,
            'name' => $terrain->name,
            'description' => $terrain->description,
            'points' => is_array($terrain->points) ? $terrain->points : [],
            'surface' => (float) $terrain->surface,
            'radius' => (float) $terrain->radius,
            'projet_id' => $terrain->projet_id,
            'statut_tech' => $terrain->statut_tech ?? 'en_cours',
            'statut_final' => $terrain->statut_final ?? 'en_cours',
            'user_ids' => is_array($terrain->user_ids) ? $terrain->user_ids : [],
            'created_at' => $terrain->created_at,
            'updated_at' => $terrain->updated_at,
            'projet_name' => $terrain->projet?->nom ?? 'Projet inconnu',
        ];
    });

    // Get all active users (profiles)
    $users = User::with('roles')->get()->map(function ($user) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];
    });

    // Keep salaries for backward compatibility (if still needed)
    $salaries = Salarie::where('statut', 'actif')->get()->map(function ($salarie) {
        return [
            'id' => $salarie->id,
            'nom' => $salarie->nom,
            'prenom' => $salarie->prenom,
            'poste' => $salarie->poste,
            'email' => $salarie->email,
            'telephone' => $salarie->telephone,
            'statut' => $salarie->statut,
            'emplacement' => $salarie->emplacement,
        ];
    });

    return Inertia::render('suivi-controle/Terrains', [
        'projects' => $projects,
        'terrains' => $terrains,
        'users' => $users,
        'salaries' => $salaries, // Keep for backward compatibility
    ]);
}
    public function fetchData()
{
    $terrains = Terrain::with('projet')->get()->map(function ($terrain) {
        return [
            'id' => $terrain->id,
            'name' => $terrain->name,
            'description' => $terrain->description,
            'points' => is_array($terrain->points) ? $terrain->points : [],
            'surface' => (float) $terrain->surface,
            'radius' => (float) $terrain->radius,
            'projet_id' => $terrain->projet_id,
            'statut_tech' => $terrain->statut_tech ?? 'en_cours',
            'statut_final' => $terrain->statut_final ?? 'en_cours',
            'user_ids' => is_array($terrain->user_ids) ? $terrain->user_ids : [],
            'created_at' => $terrain->created_at,
            'updated_at' => $terrain->updated_at,
            'projet_name' => $terrain->projet?->nom ?? 'Projet inconnu',
        ];
    });
    
    $projets = Projet::with('users')->get()->map(function ($projet) {
        return [
            'id' => $projet->id,
            'nom' => $projet->nom,
            'responsable_id' => $projet->responsable_id,
            'user_ids' => $projet->users->pluck('id')->toArray(),
        ];
    });
    
    $users = User::with('roles')->get()->map(function ($user) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];
    });

    $mssgs = Notification::where('receiver', 'suivi-controle')
        ->where('statut', 'actif')
        ->get();

    return response()->json(compact('terrains', 'projets', 'users', 'mssgs'));
}






public function migrateSalarieIdsToUserIds()
{
    try {
        $terrains = Terrain::all();
        
        foreach ($terrains as $terrain) {
            if (is_array($terrain->salarie_ids) && !empty($terrain->salarie_ids)) {
                // Find corresponding users for these salaries
                $salaries = Salarie::whereIn('id', $terrain->salarie_ids)->get();
                $userIds = [];
                
                foreach ($salaries as $salarie) {
                    // Assuming there's a way to map salaries to users
                    // This might be by email or another identifier
                    $user = User::where('email', $salarie->email)->first();
                    if ($user) {
                        $userIds[] = $user->id;
                    }
                }
                
                if (!empty($userIds)) {
                    $terrain->user_ids = $userIds;
                    $terrain->save();
                }
            }
        }
        
        return response()->json(['message' => 'Migration completed successfully']);
        
    } catch (\Exception $e) {
        Log::error('Error migrating salarie_ids to user_ids: ' . $e->getMessage());
        return response()->json(['error' => 'Migration failed'], 500);
    }
}



    /**
     * Create a new terrain
     */
    public function createTerrain(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'points'      => 'required|string',
            'surface'     => 'nullable|numeric',
            'radius'      => 'required|numeric|min:1|max:10000',
            'projet_id'   => 'required|exists:projets,id',
            'user_ids'    => 'nullable|array',
            'user_ids.*'  => 'exists:users,id',
        ]);

        // Decode and validate points
        $points = json_decode($validated['points'], true);
        if (!$points || !is_array($points)) {
            return back()->withErrors(['points' => 'Format de points invalide']);
        }

        foreach ($points as $point) {
            if (!isset($point['lat']) || !isset($point['lng']) || 
                !is_numeric($point['lat']) || !is_numeric($point['lng'])) {
                return back()->withErrors(['points' => 'Structure de points invalide']);
            }
        }

        // Create terrain
        $terrain = Terrain::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'points' => $points,
            'surface' => $validated['surface'],
            'radius' => $validated['radius'],
            'projet_id' => $validated['projet_id'],
            'user_ids' => $validated['user_ids'] ?? [],
            'statut_tech' => 'en_cours',
            'statut_final' => 'en_cours',
        ]);

        // Update project terrain_ids
        $projet = Projet::find($validated['projet_id']);
        if ($projet) {
            $terrainIds = is_array($projet->terrain_ids) ? $projet->terrain_ids : [];
            $terrainIds[] = $terrain->id;
            $projet->terrain_ids = array_unique($terrainIds);
            $projet->save();
        }

        return redirect()->back()->with('success', 'Terrain créé avec succès');
    }
    /**
     * Update an existing terrain
     */
    public function editTerrain(Request $request, $id)
    {
        $terrain = Terrain::findOrFail($id);
        
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:500',
            'points'      => 'sometimes|string',
            'surface'     => 'nullable|numeric',
            'radius'      => 'sometimes|numeric|min:1|max:10000',
            'user_ids'    => 'nullable|array',
            'user_ids.*'  => 'exists:users,id',
        ]);

        // Handle points if provided
        if (isset($validated['points'])) {
            $points = json_decode($validated['points'], true);
            if (!$points || !is_array($points)) {
                return back()->withErrors(['points' => 'Format de points invalide']);
            }

            foreach ($points as $point) {
                if (!isset($point['lat']) || !isset($point['lng']) || 
                    !is_numeric($point['lat']) || !is_numeric($point['lng'])) {
                    return back()->withErrors(['points' => 'Structure de points invalide']);
                }
            }
            
            $validated['points'] = $points;
        }

        $terrain->update($validated);

        return redirect()->back()->with('success', 'Terrain modifié avec succès');
    }

    /**
     * Delete a terrain
     */
   public function deleteTerrain($id)
    {
        try {
            $terrain = Terrain::findOrFail($id);

            // Remove terrain from project
            if ($terrain->projet_id) {
                $projet = Projet::find($terrain->projet_id);
                if ($projet) {
                    $terrainIds = is_array($projet->terrain_ids) ? $projet->terrain_ids : [];
                    $projet->terrain_ids = array_values(array_diff($terrainIds, [$terrain->id]));
                    $projet->save();
                }
            }

            $terrain->delete();

            return redirect()->back()->with('success', 'Terrain supprimé avec succès');

        } catch (\Exception $e) {
            Log::error('Error deleting terrain: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la suppression du terrain');
        }
    }


    /**
 * Assign/Remove user to/from project (using pivot table)
 */
public function assignUserToProject(Request $request)
{
    $validator = Validator::make($request->all(), [
        'user_id' => 'required|exists:users,id',
        'projet_id' => 'required|exists:projets,id',
    ]);

    if ($validator->fails()) {
        return redirect()->back()->with('error', 'Données invalides');
    }

    try {
        $projet = Projet::findOrFail($request->projet_id);
        $user = User::findOrFail($request->user_id);

        // Check if already assigned
        $isAssigned = $projet->activeUsers()->where('users.id', $user->id)->exists();

        if ($isAssigned) {
            // Remove assignment
            $projet->users()->detach($user->id);
            $message = "Profil retiré du projet avec succès";
        } else {
            // Add assignment
            $projet->users()->attach($user->id, [
                'date_affectation' => now(),
                'statut' => 'actif'
            ]);
            $message = "Profil affecté au projet avec succès";
        }

        return redirect()->back()->with('success', $message);

    } catch (\Exception $e) {
        Log::error('Error assigning user to project: ' . $e->getMessage());
        return redirect()->back()->with('error', "Erreur lors de l'affectation");
    }
}




/**
 * Assign/Remove user to/from terrain
 */
public function affectGrantUser(Request $request)
{
    $validator = Validator::make($request->all(), [
        'user_id' => 'required|exists:users,id',
        'terrain_id' => 'required|exists:terrains,id',
    ]);

    if ($validator->fails()) {
        return redirect()->back()->with('error', 'Données invalides');
    }

    try {
        $user = User::findOrFail($request->user_id);
        $terrain = Terrain::findOrFail($request->terrain_id);
        $projet = Projet::with('activeUsers')->findOrFail($terrain->projet_id);

        // Check if user is assigned to project
        $projectUserIds = $projet->activeUsers->pluck('id')->toArray();
        
        if (!in_array($user->id, $projectUserIds)) {
            return redirect()->back()->with('error', 'Ce profil n\'est pas assigné au projet de ce terrain');
        }

        // Get current terrain assignments from salarie_ids column (using it as user_ids)
        $terrainUserIds = is_array($terrain->salarie_ids) ? $terrain->salarie_ids : [];

        // Check if already assigned
        $alreadyAssigned = in_array($user->id, $terrainUserIds);

        if ($alreadyAssigned) {
            // Remove assignment
            $terrainUserIds = array_values(array_filter($terrainUserIds, fn($id) => $id !== $user->id));
        } else {
            // Add assignment
            if (!in_array($user->id, $terrainUserIds)) {
                $terrainUserIds[] = $user->id;
            }
        }

        // Save terrain using salarie_ids column
        $terrain->salarie_ids = $terrainUserIds;
        $terrain->save();

        $action = $alreadyAssigned ? 'retiré du' : 'affecté au';
        return redirect()->back()->with('success', "Profil {$action} terrain avec succès");

    } catch (\Exception $e) {
        Log::error('Error toggling user/terrain assignment: ' . $e->getMessage());
        return redirect()->back()->with('error', "Erreur lors de l'affectation");
    }
}




/**
 * Update project users assignment
 */
public function updateProjetUsers(Request $request)
{
    $validator = Validator::make($request->all(), [
        'projet_id' => 'required|exists:projets,id',
        'user_ids' => 'required|array',
        'user_ids.*' => 'exists:users,id',
    ]);

    if ($validator->fails()) {
        return redirect()->back()
            ->withErrors($validator)
            ->with('error', 'Données invalides');
    }

    try {
        $validated = $validator->validated();
        $projet = Projet::findOrFail($validated['projet_id']);

        // Sync users in pivot table
        $syncData = [];
        foreach ($validated['user_ids'] as $userId) {
            $syncData[$userId] = [
                'date_affectation' => now(),
                'statut' => 'actif'
            ];
        }

        $projet->users()->sync($syncData);

        return redirect()->back()->with('success', 'Profils du projet mis à jour avec succès');

    } catch (\Exception $e) {
        Log::error('Error updating project users: ' . $e->getMessage());
        return redirect()->back()->with('error', 'Erreur lors de la mise à jour');
    }
}




/**
 * Get project users with details
 */
public function getProjectUsers($projectId)
{
    try {
        $projet = Projet::with(['activeUsers' => function($query) {
            $query->with(['roles']);
        }])->findOrFail($projectId);

        $users = $projet->activeUsers->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'date_affectation' => $user->pivot->date_affectation,
                'statut' => $user->pivot->statut,
            ];
        });

        return response()->json([
            'project' => [
                'id' => $projet->id,
                'nom' => $projet->nom,
                'users_count' => $users->count()
            ],
            'users' => $users
        ]);

    } catch (\Exception $e) {
        Log::error('Error fetching project users: ' . $e->getMessage());
        return response()->json(['error' => 'Project users fetch failed'], 500);
    }
}
    /**
     * Toggle salarie assignment to terrain
     */
    public function affectGrantSalarie(Request $request)
{
    $validator = Validator::make($request->all(), [
        'salarie_id' => 'required|exists:salaries,id',
        'terrain_id' => 'required|exists:terrains,id',
    ]);

    if ($validator->fails()) {
        return redirect()->back()->with('error', 'Données invalides');
    }

    try {
        $salarie = Salarie::findOrFail($request->salarie_id);
        $terrain = Terrain::findOrFail($request->terrain_id);
        $projet = Projet::with('salaries')->findOrFail($terrain->projet_id);

        // Check if salarie is assigned to project via projet_salarie pivot
        $projectSalarieIds = $projet->salaries->pluck('id')->toArray();
        
        if (!in_array($salarie->id, $projectSalarieIds)) {
            return redirect()->back()->with('error', 'Ce profil n\'est pas assigné au projet de ce terrain');
        }

        // Get current terrain assignments
        $terrainSalarieIds = is_array($terrain->salarie_ids) ? $terrain->salarie_ids : [];
        $salarieTerrainIds = is_array($salarie->terrain_ids) ? $salarie->terrain_ids : [];

        // Check if already assigned
        $alreadyAssigned = in_array($salarie->id, $terrainSalarieIds);

        if ($alreadyAssigned) {
            // Remove assignment
            $terrainSalarieIds = array_values(array_filter($terrainSalarieIds, fn($id) => $id !== $salarie->id));
            $salarieTerrainIds = array_values(array_filter($salarieTerrainIds, fn($id) => $id !== $terrain->id));
        } else {
            // Add assignment
            if (!in_array($salarie->id, $terrainSalarieIds)) {
                $terrainSalarieIds[] = $salarie->id;
            }
            if (!in_array($terrain->id, $salarieTerrainIds)) {
                $salarieTerrainIds[] = $terrain->id;
            }
            
            // Ensure salarie is assigned to the terrain's project
            $salarieProjetIds = is_array($salarie->projet_ids) ? $salarie->projet_ids : [];
            if (!in_array($terrain->projet_id, $salarieProjetIds)) {
                $salarieProjetIds[] = $terrain->projet_id;
                $salarie->projet_ids = $salarieProjetIds;
            }
        }

        // Save both models
        $terrain->salarie_ids = $terrainSalarieIds;
        $terrain->save();

        $salarie->terrain_ids = $salarieTerrainIds;
        $salarie->save();

        $action = $alreadyAssigned ? 'retiré du' : 'affecté au';
        return redirect()->back()->with('success', "Profil {$action} terrain avec succès");

    } catch (\Exception $e) {
        Log::error('Error toggling salarie/terrain assignment: ' . $e->getMessage());
        return redirect()->back()->with('error', "Erreur lors de l'affectation");
    }
}




/**
 * Assign/Remove salarie to/from project using the existing pivot table
 */
public function assignSalarieToProject(Request $request)
{
    $validator = Validator::make($request->all(), [
        'salarie_id' => 'required|exists:salaries,id',
        'projet_id' => 'required|exists:projets,id',
    ]);

    if ($validator->fails()) {
        return redirect()->back()->with('error', 'Données invalides');
    }

    try {
        $projet = Projet::findOrFail($request->projet_id);
        $salarie = Salarie::findOrFail($request->salarie_id);

        // Check if already assigned using the pivot relationship
        $isAssigned = $projet->salaries()->where('salaries.id', $salarie->id)->exists();

        if ($isAssigned) {
            // Remove assignment
            $projet->salaries()->detach($salarie->id);
            $message = "Profil retiré du projet avec succès";
        } else {
            // Add assignment
            $projet->salaries()->attach($salarie->id, [
                'date_affectation' => now()
            ]);
            $message = "Profil affecté au projet avec succès";
        }

        return redirect()->back()->with('success', $message);

    } catch (\Exception $e) {
        Log::error('Error assigning salarie to project: ' . $e->getMessage());
        return redirect()->back()->with('error', "Erreur lors de l'affectation");
    }
}



/**
 * Sync project relationships - call this to ensure data consistency
 */
public function syncProjectSalaries($projectId)
{
    try {
        $projet = Projet::with('salaries')->findOrFail($projectId);
        
        // Get salaries from both relationship and JSON
        $relationshipSalarieIds = $projet->salaries->pluck('id')->toArray();
        $jsonSalarieIds = is_array($projet->salarie_ids) ? $projet->salarie_ids : [];
        
        // Merge and update both
        $allSalarieIds = array_unique(array_merge($relationshipSalarieIds, $jsonSalarieIds));
        
        // Update JSON field
        $projet->salarie_ids = $allSalarieIds;
        $projet->save();
        
        // Update pivot table if needed
        $projet->salaries()->sync($allSalarieIds);
        
        return response()->json(['message' => 'Project salaries synchronized successfully']);
        
    } catch (\Exception $e) {
        Log::error('Error syncing project salaries: ' . $e->getMessage());
        return response()->json(['error' => 'Sync failed'], 500);
    }
}


    /**
 * Ensure data consistency between projects, terrains, and salaries
 */
public function validateProfileAssignments()
{
    try {
        $inconsistencies = [];
        
        $terrains = Terrain::all();
        
        foreach ($terrains as $terrain) {
            $projet = Projet::find($terrain->projet_id);
            if (!$projet) continue;
            
            $projectSalarieIds = is_array($projet->salarie_ids) ? $projet->salarie_ids : [];
            $terrainSalarieIds = is_array($terrain->salarie_ids) ? $terrain->salarie_ids : [];
            
            // Check if terrain has profiles not in project
            $orphanedProfiles = array_diff($terrainSalarieIds, $projectSalarieIds);
            
            if (!empty($orphanedProfiles)) {
                $inconsistencies[] = [
                    'terrain_id' => $terrain->id,
                    'terrain_name' => $terrain->name,
                    'project_name' => $projet->nom,
                    'orphaned_profiles' => $orphanedProfiles
                ];
            }
        }
        
        return response()->json([
            'status' => empty($inconsistencies) ? 'consistent' : 'inconsistent',
            'inconsistencies' => $inconsistencies
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error validating profile assignments: ' . $e->getMessage());
        return response()->json(['error' => 'Validation failed'], 500);
    }
}

    /**
     * Update notification status (mark as read)
     */
    public function updateNotificationStatus(Request $request, $id)
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->statut = 'inactif'; // Mark as read/inactive
            $notification->save();

            return redirect()->back()->with('success', 'Notification marquée comme lue');

        } catch (\Exception $e) {
            Log::error('Error updating notification status: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la mise à jour de la notification');
        }
    }

    /**
     * Fetch specific terrain data
     */
    public function fetchTerrains()
    {
        $data = Terrain::with('projet')->get()->map(function ($terrain) {
            $projet = $terrain->projet;

            $salaries = collect($terrain->salarie_ids ?? [])->map(function ($sId) {
                $salarie = Salarie::find($sId);
                if (!$salarie) return null;

                $territories = Terrain::whereJsonContains('salarie_ids', $salarie->id)
                    ->get(['id', 'surface', 'points']);
                
                return [
                    'salarie' => $salarie,
                    'salarie_terrs' => $territories,
                ];
            })->filter(); // Remove nulls

            return [
                'terrain' => $terrain,
                'projet' => $projet,
                'salaries' => $salaries->values(),
            ];
        });

        return response()->json($data);
    }

    /**
     * Fetch specific salarie data with terrains
     */
    public function fetchSalarieData($salarieId)
    {
        try {
            $salarie = Salarie::findOrFail($salarieId);

            // Load terrains assigned to this salarie
            $terrains = Terrain::whereRaw('JSON_CONTAINS(salarie_ids, ?)', [json_encode(intval($salarieId))])
                ->with('projet')
                ->get();

            // Get today's work data if you have a WsTechData model
            $today = now()->startOfDay();
            $wsData = [];
            
            // Uncomment if you have WsTechData model
            // $wsData = WsTechData::where('salarie_id', $salarieId)
            //     ->where('recorded_at', '>=', $today)
            //     ->get();

            return response()->json([
                'salarie' => $salarie,
                'terrains' => $terrains,
                'wsData' => $wsData,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching salarie data: ' . $e->getMessage());
            return response()->json(['error' => 'Salarie not found'], 404);
        }
    }

    /**
     * Update project salaries assignment
     */
    public function updateProjetSalaries(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'projet_id' => 'required|exists:projets,id',
            'name' => 'required|string',
            'salarie_ids' => 'required|array',
            'salarie_ids.*' => 'exists:salaries,id',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->with('error', 'Données invalides');
        }

        try {
            $validated = $validator->validated();
            
            $projet = Projet::where('id', $validated['projet_id'])
                            ->where('nom', $validated['name'])
                            ->first();

            if (!$projet) {
                return redirect()->back()->with('error', 'Projet introuvable ou nom incorrect');
            }

            // Update project salarie_ids
            $projet->salarie_ids = $validated['salarie_ids'];
            $projet->save();

            // Add this project to each selected salarie's projet_ids
            foreach ($validated['salarie_ids'] as $salarieId) {
                $salarie = Salarie::find($salarieId);
                if ($salarie) {
                    $currentProjetIds = is_array($salarie->projet_ids) ? $salarie->projet_ids : [];

                    if (!in_array($projet->id, $currentProjetIds)) {
                        $currentProjetIds[] = $projet->id;
                        $salarie->projet_ids = $currentProjetIds;
                        $salarie->save();
                    }
                }
            }

            return redirect()->back()->with('success', 'Projet et profils mis à jour avec succès');

        } catch (\Exception $e) {
            Log::error('Error updating project salaries: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la mise à jour');
        }
    }


#######################################################################################################################
#######################################################################################################################
#######################################################################################################################
#######################################################################################################################
#######################################################################################################################
#######################################################################################################################

public function Tracking()
    {
        return Inertia::render('suivi-controle/Tracking');

    }

    public function fetchAll()
    {
        $users = User::all();
        $plans = Plan::latest()->get();
        $terrains = Terrain::all();
        $projets = Projet::all();
        $salaries = Salarie::where('statut', 'actif')->get();
        $vehicules = Vehicule::all();
        $allProfils = Profil::all();

        // Build lookup maps for fast access
        $salarieLookup = $salaries->keyBy('id');
        $terrainLookup = $terrains->keyBy('id');

        // Attach profils to each salarie
        $salaries->transform(function ($salarie) use ($allProfils) {
            $salarie->profils = $allProfils
                ->where('user_id', $salarie->id)
                ->values()
                ->map(function ($profil) {
                    return [
                        'id' => $profil->id,
                        'nom_profil' => $profil->nom_profil,
                        'poste_profil' => $profil->poste_profil,
                    ];
                });
            return $salarie;
        });

        // Attach related data manually to each projet
        $projets->transform(function ($projet) use ($plans, $terrainLookup, $salarieLookup, $vehicules) {
            // Plans for this projet
            $projetPlans = $plans->where('projet_id', $projet->id)->values();

            // Already cast to array by Eloquent
            $terrainIds = $projet->terrain_ids ?? [];
            $salarieIds = $projet->salarie_ids ?? [];

            // Get terrain objects
            $projetTerrains = collect($terrainIds)->map(function ($id) use ($terrainLookup) {
                return $terrainLookup->get($id);
            })->filter()->values();

            // Get salarie objects
            $projetSalaries = collect($salarieIds)->map(function ($id) use ($salarieLookup) {
                return $salarieLookup->get($id);
            })->filter()->values();

            // Vehicules assigned to these salaries
            $projetVehicules = $vehicules->whereIn('salarie_id', $salarieIds)->values();

            // Attach manually
            $projet->plans = $projetPlans;
            $projet->terrains = $projetTerrains;
            $projet->salaries = $projetSalaries;
            $projet->vehicules = $projetVehicules;

            return $projet;
        });

        // Notifications
        $mssgs = Notification::where('receiver', 'suivi-controle')
            ->where('statut', 'actif')
            ->get();

        return response()->json(compact('plans', 'terrains', 'projets', 'salaries', 'mssgs','users'));
    }

    public function sendChat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $notification = Notification::create([
            'sender' => 'suivi-controle',
            'receiver' => 'all',
            'message' => $request->message,
            'statut' => 'actif', 
            'recorded_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Mssg Transfere avec succès');

    }

    ######################################################

    public function Ressources()
    {
        // Fetch all projets with only id and nom
        $projets = Projet::select('id', 'nom')->get();

        // Pass the projets to the Inertia view
        return Inertia::render('suivi-controle/Ressources', [
            'projets' => $projets
        ]);
    }

    public function getProjetRessources($projet_id)
    {
        // Fetch the specific project by projet_id
        $projet = Projet::findOrFail($projet_id);

        // Get related data for the project
        $terrains = Terrain::whereIn('id', $projet->terrain_ids ?? [])->get();
        $salaries = Salarie::whereIn('id', $projet->salarie_ids ?? [])->where('statut', 'actif')->get();
        $vehicules = Vehicule::whereIn('salarie_id', $projet->salarie_ids ?? [])->get();
        $materiels = Materiel::whereIn('salarie_id', $projet->salarie_ids ?? [])->get();
        $logiciels = Logiciel::whereIn('id', $salaries->pluck('logiciel_id'))->get();

        // ✅ Fetch all profils before using the variable
        $allProfils = Profil::all();

        // Lookup maps for performance
        $salarieLookup = $salaries->keyBy('id');
        $terrainLookup = $terrains->keyBy('id');

        // Attach profils to each salarie
        $salaries->transform(function ($salarie) use ($allProfils) {
            $salarie->profils = $allProfils
                ->where('user_id', $salarie->id)
                ->values()
                ->map(function ($profil) {
                    return [
                        'id' => $profil->id,
                        'nom_profil' => $profil->nom_profil,
                        'poste_profil' => $profil->poste_profil,
                    ];
                });
            return $salarie;
        });

        // Attach terrains to projet
        $projet->terrains = $terrains;

        // Attach resources to each salarie
        $projetSalaries = $salaries->map(function ($salarie) use ($vehicules, $materiels, $terrainLookup) {
            $salarie->vehicules = $vehicules->where('salarie_id', $salarie->id)->values();
            $salarie->materiels = $materiels->where('salarie_id', $salarie->id)->values();
            $salarie->terrains = collect($salarie->terrain_ids)->map(function ($terrainId) use ($terrainLookup) {
                return $terrainLookup->get($terrainId);
            })->filter();
            return $salarie;
        });

        // Attach salaries to the projet
        $projet->salaries = $projetSalaries;

        // Active notifications for suivi-controle
        $mssgs = Notification::where('receiver', 'suivi-controle')
            ->where('statut', 'actif')
            ->get();

        return response()->json(compact(
            'projet',
            'terrains',
            'salaries',
            'vehicules',
            'materiels',
            'logiciels',
            'mssgs'
        ));
    }


























































#######################################################################################################################
#######################################################################################################################
#######################################################################################################################
#######################################################################################################################
#######################################################################################################################
#######################################################################################################################

        public function planing()
    {
        return Inertia::render('suivi-controle/Planings', [
            'title' => 'Planification - Suivi & Contrôle des Travaux'
        ]);
    }

    /**
     * Fetch all data needed for the planning page
     */
    public function fetchPlans()
    {
        try {
            // Fetch plans with related data
            $plans = Plan::with(['projet'])
                ->orderBy('date_debut', 'desc')
                ->get()
                ->map(function ($plan) {
                    return [
                        'id' => $plan->id,
                        'date_debut' => $plan->date_debut ? $plan->date_debut->format('Y-m-d H:i:s') : null,
                        'date_fin' => $plan->date_fin ? $plan->date_fin->format('Y-m-d H:i:s') : null,
                        'mssg' => $plan->mssg,
                        'description' => $plan->description,
                        'terrains_ids' => $plan->terrains_ids ?? [],
                        'salarie_ids' => $plan->salarie_ids ?? [],
                        'statut' => $plan->statut,
                        'projet_id' => $plan->projet_id,
                        'projet' => $plan->projet ? [
                            'id' => $plan->projet->id,
                            'nom' => $plan->projet->nom,
                            'description' => $plan->projet->description,
                            'date_debut' => $plan->projet->date_debut,
                            'date_fin' => $plan->projet->date_fin,
                            'statut' => $plan->projet->statut,
                            'client' => $plan->projet->client,
                            'lieu_realisation' => $plan->projet->lieu_realisation,
                        ] : null,
                        'plan_docs' => $plan->plan_docs ?? [],
                        'docs_ids' => $this->extractDocIds($plan->plan_docs),
                        'created_at' => $plan->created_at,
                        'updated_at' => $plan->updated_at,
                    ];
                });

            // Fetch projects
            $projets = Projet::select([
                'id', 'nom', 'description', 'budget_total', 'date_debut', 
                'date_fin', 'statut', 'client', 'lieu_realisation', 'responsable_id'
            ])
            ->orderBy('nom')
            ->get()
            ->map(function ($projet) {
                return [
                    'id' => $projet->id,
                    'nom' => $projet->nom,
                    'description' => $projet->description,
                    'budget_total' => $projet->budget_total,
                    'date_debut' => $projet->date_debut,
                    'date_fin' => $projet->date_fin,
                    'statut' => $projet->statut,
                    'client' => $projet->client,
                    'lieu_realisation' => $projet->lieu_realisation,
                    'responsable_id' => $projet->responsable_id,
                    'docs_needs' => $this->getProjectDocsNeeds($projet->id),
                ];
            });

            // Fetch terrains with proper relationship loading
            $terrains = Terrain::with(['projet'])
                ->select([
                    'id', 'name', 'description', 'points', 'surface', 'radius', 
                    'projet_id', 'statut_tech', 'statut_final', 'salarie_ids', 'user_ids'
                ])
                ->orderBy('name')
                ->get()
                ->map(function ($terrain) {
                    return [
                        'id' => $terrain->id,
                        'name' => $terrain->name,
                        'description' => $terrain->description,
                        'points' => $terrain->points ?? [],
                        'surface' => (float) ($terrain->surface ?? 0),
                        'radius' => (float) ($terrain->radius ?? 0),
                        'projet_id' => $terrain->projet_id,
                        'projet_name' => $terrain->projet ? $terrain->projet->nom : 'Projet inconnu',
                        'statut_tech' => $terrain->statut_tech,
                        'statut_final' => $terrain->statut_final,
                        'salarie_ids' => $terrain->salarie_ids ?? [],
                        'user_ids' => $terrain->user_ids ?? [],
                    ];
                });

            // Fetch salaries
            $salaries = Salarie::select([
                'id', 'nom', 'prenom', 'poste', 'email', 'telephone', 
                'salaire_mensuel', 'date_embauche', 'statut', 'emplacement',
                'projet_ids', 'terrain_ids', 'user_id'
            ])
            ->orderBy('nom')
            ->get()
            ->map(function ($salarie) {
                return [
                    'id' => $salarie->id,
                    'nom' => $salarie->nom,
                    'prenom' => $salarie->prenom,
                    'poste' => $salarie->poste ?? '',
                    'email' => $salarie->email,
                    'telephone' => $salarie->telephone ?? '',
                    'salaire_mensuel' => (float) ($salarie->salaire_mensuel ?? 0),
                    'date_embauche' => $salarie->date_embauche,
                    'statut' => $salarie->statut ?? 'actif',
                    'emplacement' => $salarie->emplacement ?? 'bureau',
                    'user_id' => $salarie->user_id,
                    'projet_ids' => $this->getSalarieProjetIds($salarie->id),
                    'terrain_ids' => $this->getSalarieTerrainIds($salarie->id),
                ];
            });

            // Debug: Log the salaries data to check what's being returned
            Log::info('Fetched salaries data:', [
                'total_count' => $salaries->count(),
                'terrain_salaries_count' => $salaries->where('emplacement', 'terrain')->count(),
                'sample_data' => $salaries->take(3)->toArray()
            ]);

            return response()->json([
                'plans' => $plans,
                'projets' => $projets,
                'terrains' => $terrains,
                'salaries' => $salaries,
                'success' => true
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching plans data: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Erreur lors de la récupération des données: ' . $e->getMessage(),
                'plans' => [],
                'projets' => [],
                'terrains' => [],
                'salaries' => [],
                'success' => false
            ], 500);
        }
    }

    /**
     * Store a new plan
     */
    public function storePlan(Request $request)
    {
        try {
            $validated = $request->validate([
                'projet_id' => 'required|exists:projets,id',
                'date_debut' => 'required|date',
                'date_fin' => 'required|date|after_or_equal:date_debut',
                'mssg' => 'nullable|string|max:500',
                'description' => 'nullable|string|max:1000',
                'terrains_ids' => 'nullable|array',
                'terrains_ids.*' => 'exists:terrains,id',
                'salarie_ids' => 'nullable|array',
                'salarie_ids.*' => 'exists:salaries,id',
                'statut' => 'required|in:prévu,en_cours,terminé,annulé',
                'docs_ids' => 'nullable|array',
                'docs_ids.*' => 'exists:documents,id',
            ]);

            DB::beginTransaction();

            // Prepare plan_docs if docs_ids provided
            $planDocs = [];
            if (!empty($validated['docs_ids'])) {
                $documents = Document::whereIn('id', $validated['docs_ids'])->get();
                foreach ($documents as $document) {
                    $planDocs[] = [
                        'nom' => $document->nom,
                        'type' => $document->type ?? $document->file_type,
                        'description' => $document->description ?? '',
                        'doc_id' => $document->id,
                    ];
                }
            }

            $plan = Plan::create([
                'projet_id' => $validated['projet_id'],
                'date_debut' => $validated['date_debut'],
                'date_fin' => $validated['date_fin'],
                'mssg' => $validated['mssg'],
                'description' => $validated['description'],
                'terrains_ids' => $validated['terrains_ids'] ?? [],
                'salarie_ids' => $validated['salarie_ids'] ?? [],
                'statut' => $validated['statut'],
                'plan_docs' => $planDocs,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Plan créé avec succès',
                'plan' => $plan->load('projet'),
                'success' => true
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
                'success' => false
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating plan: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la création du plan: ' . $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Update an existing plan
     */
    public function updatePlan(Request $request, Plan $plan)
    {
        try {
            $validated = $request->validate([
                'projet_id' => 'required|exists:projets,id',
                'date_debut' => 'required|date',
                'date_fin' => 'required|date|after_or_equal:date_debut',
                'mssg' => 'nullable|string|max:500',
                'description' => 'nullable|string|max:1000',
                'terrains_ids' => 'nullable|array',
                'terrains_ids.*' => 'exists:terrains,id',
                'salarie_ids' => 'nullable|array',
                'salarie_ids.*' => 'exists:salaries,id',
                'statut' => 'required|in:prévu,en_cours,terminé,annulé',
                'docs_ids' => 'nullable|array',
                'docs_ids.*' => 'exists:documents,id',
            ]);

            DB::beginTransaction();

            // Prepare plan_docs if docs_ids provided
            $planDocs = [];
            if (!empty($validated['docs_ids'])) {
                $documents = Document::whereIn('id', $validated['docs_ids'])->get();
                foreach ($documents as $document) {
                    $planDocs[] = [
                        'nom' => $document->nom,
                        'type' => $document->type ?? $document->file_type,
                        'description' => $document->description ?? '',
                        'doc_id' => $document->id,
                    ];
                }
            }

            $plan->update([
                'projet_id' => $validated['projet_id'],
                'date_debut' => $validated['date_debut'],
                'date_fin' => $validated['date_fin'],
                'mssg' => $validated['mssg'],
                'description' => $validated['description'],
                'terrains_ids' => $validated['terrains_ids'] ?? [],
                'salarie_ids' => $validated['salarie_ids'] ?? [],
                'statut' => $validated['statut'],
                'plan_docs' => $planDocs,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Plan modifié avec succès',
                'plan' => $plan->fresh()->load('projet'),
                'success' => true
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
                'success' => false
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating plan: ' . $e->getMessage(), [
                'plan_id' => $plan->id,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la modification du plan: ' . $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Delete a plan
     */
    public function destroyPlan(Plan $plan)
    {
        try {
            DB::beginTransaction();

            // Delete related tasks first
            Task::where('plan_id', $plan->id)->delete();

            // Delete the plan
            $plan->delete();

            DB::commit();

            return response()->json([
                'message' => 'Plan supprimé avec succès',
                'success' => true
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting plan: ' . $e->getMessage(), [
                'plan_id' => $plan->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la suppression du plan: ' . $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Store a new task for a plan
     */
    public function storeTask(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'date_debut' => 'required|date',
                'date_fin' => 'required|date|after_or_equal:date_debut',
                'salaries_ids' => 'required|array|min:1',
                'salaries_ids.*' => 'exists:salaries,id',
                'plan_id' => 'required|exists:plans,id',
            ]);

            DB::beginTransaction();

            // Verify that the plan exists and the salaries are assigned to it
            $plan = Plan::findOrFail($validated['plan_id']);
            $planSalarieIds = $plan->salarie_ids ?? [];
            
            // Check if all requested salaries are assigned to the plan
            $invalidSalaries = array_diff($validated['salaries_ids'], $planSalarieIds);
            if (!empty($invalidSalaries)) {
                throw ValidationException::withMessages([
                    'salaries_ids' => 'Certains salariés sélectionnés ne sont pas assignés à ce plan.'
                ]);
            }

            $task = Task::create([
                'nom' => $validated['nom'],
                'description' => $validated['description'],
                'date_debut' => $validated['date_debut'],
                'date_fin' => $validated['date_fin'],
                'salaries_ids' => $validated['salaries_ids'],
                'plan_id' => $validated['plan_id'],
                'statut' => 'prévu', // Default status
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Tâche créée avec succès',
                'task' => $task->load('plan.projet'),
                'success' => true
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
                'success' => false
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating task: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la création de la tâche: ' . $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Helper method to extract document IDs from plan_docs
     */
    private function extractDocIds($planDocs)
    {
        if (empty($planDocs) || !is_array($planDocs)) {
            return [];
        }

        return collect($planDocs)
            ->pluck('doc_id')
            ->filter()
            ->values()
            ->toArray();
    }

    /**
     * Helper method to get project document requirements
     */
    private function getProjectDocsNeeds($projetId)
    {
        try {
            $projet = Projet::find($projetId);
            if (!$projet || empty($projet->rh_needs)) {
                return [];
            }

            // Return the project's rh_needs which should contain document requirements
            return is_array($projet->rh_needs) ? $projet->rh_needs : [];

        } catch (\Exception $e) {
            Log::warning('Error getting project docs needs: ' . $e->getMessage(), [
                'projet_id' => $projetId
            ]);
            return [];
        }
    }

    /**
     * Helper method to get terrain assignments for salaries
     */
    private function getSalarieTerrainIds($salarieId)
    {
        try {
            $salarie = Salarie::find($salarieId);
            if (!$salarie) {
                return [];
            }

            // Get terrain IDs from salarie's terrain_ids field
            $terrainIds = is_array($salarie->terrain_ids) ? $salarie->terrain_ids : [];

            // Also get terrains where this salarie is assigned via salarie_ids JSON field
            $additionalTerrainIds = Terrain::whereJsonContains('salarie_ids', $salarieId)
                ->pluck('id')
                ->toArray();

            return array_unique(array_merge($terrainIds, $additionalTerrainIds));

        } catch (\Exception $e) {
            Log::warning('Error getting salarie terrain IDs: ' . $e->getMessage(), [
                'salarie_id' => $salarieId
            ]);
            return [];
        }
    }

    /**
     * Helper method to get project assignments through terrains and direct assignments
     */
    private function getSalarieProjetIds($salarieId)
    {
        try {
            $salarie = Salarie::find($salarieId);
            if (!$salarie) {
                return [];
            }

            // Get project IDs from salarie's projet_ids field
            $projetIds = is_array($salarie->projet_ids) ? $salarie->projet_ids : [];

            // Also get projects through terrain assignments
            $terrainIds = $this->getSalarieTerrainIds($salarieId);
            if (!empty($terrainIds)) {
                $additionalProjetIds = Terrain::whereIn('id', $terrainIds)
                    ->whereNotNull('projet_id')
                    ->pluck('projet_id')
                    ->filter()
                    ->toArray();
                
                $projetIds = array_unique(array_merge($projetIds, $additionalProjetIds));
            }

            // Also check many-to-many relationship through projet_salarie pivot table
            $pivotProjetIds = DB::table('projet_salarie')
                ->where('salarie_id', $salarieId)
                ->pluck('projet_id')
                ->toArray();

            $projetIds = array_unique(array_merge($projetIds, $pivotProjetIds));

            return array_values($projetIds);

        } catch (\Exception $e) {
            Log::warning('Error getting salarie projet IDs: ' . $e->getMessage(), [
                'salarie_id' => $salarieId
            ]);
            return [];
        }
    }

    /**
     * Helper method to filter plans by time period
     */
    public function getPlansForPeriod($startDate, $endDate, $projetId = null, $salarieId = null)
    {
        try {
            $query = Plan::with(['projet'])
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('date_debut', [$startDate, $endDate])
                      ->orWhereBetween('date_fin', [$startDate, $endDate])
                      ->orWhere(function ($q2) use ($startDate, $endDate) {
                          $q2->where('date_debut', '<=', $startDate)
                             ->where('date_fin', '>=', $endDate);
                      });
                });

            if ($projetId) {
                $query->where('projet_id', $projetId);
            }

            if ($salarieId) {
                $query->whereJsonContains('salarie_ids', $salarieId);
            }

            return $query->orderBy('date_debut')->get();

        } catch (\Exception $e) {
            Log::error('Error getting plans for period: ' . $e->getMessage(), [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'projet_id' => $projetId,
                'salarie_id' => $salarieId
            ]);
            return collect();
        }
    }
    ######################################################
    public function storePosition(Request $request)
    {
        // Validate incoming data
        $validated = $request->validate([
            'salarie_id' => 'required|exists:salaries,id',
            'lat' => 'required|numeric',
            'long' => 'required|numeric',
            'alt' => 'nullable|numeric',
            'recorded_at' => 'required|date',
        ]);

        // Save position data to the database
        $position = WsTechData::create([
            'salarie_id' => $validated['salarie_id'],
            'lat' => $validated['lat'],
            'long' => $validated['long'],
            'alt' => $validated['alt'],
            'recorded_at' => $validated['recorded_at'],
        ]);

        // Broadcast the new position data
        broadcast(new WsTechDataReceived($position->toArray()));

        return response()->json(['message' => 'Position saved and broadcasted']);
    }
}