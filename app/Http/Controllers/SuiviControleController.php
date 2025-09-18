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
use App\Models\Notification;

use Carbon\Carbon;


use App\Models\WsTechData;
use App\Events\WsTechDataReceived;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Log;


class SuiviControleController extends Controller
{
    public function index()
    {
        return Inertia::render('suivi-controle/Dashboard');

    }

    public function Terrains()
    {
        return Inertia::render('suivi-controle/Terrains');

    }

       public function fetchData()
    {
        $terrains = Terrain::all();
        $projets  = Projet::all();
        $salaries = Salarie::where('statut', 'actif')->get();
        $allProfils = Profil::all();

        // Map each salarie to their profils manually
        $salaries->transform(function ($salarie) use ($allProfils) {
            $salarie->profils = $allProfils
                ->where('user_id', $salarie->id)
                ->values() // reset array indices
                ->map(function ($profil) {
                    // Optional: transform profil object as needed
                    return [
                        'id' => $profil->id,
                        'nom_profil' => $profil->nom_profil,
                        'poste_profil' => $profil->poste_profil,
                    ];
                });
            return $salarie;
        });

       $mssgs = Notification::where('receiver', 'suivi-controle')
        ->where('statut', 'actif')
        ->get();

        return response()->json(compact('terrains', 'projets', 'salaries','mssgs'));
    }

    public function fetchTerrains()
    {
        $data = Terrain::all()->map(function ($terrain) {
            $projet = Projet::find($terrain->projet_id);

            $salaries = collect($terrain->salarie_ids ?? [])->map(function ($sId) {
                return Salarie::find($sId);
            })->filter(); // Remove potential nulls

            $salaries = $salaries->map(function ($salarie) {
                $territories = Terrain::whereJsonContains('salarie_ids', $salarie->id)
                    ->get(['id', 'surface', 'points']);
                return [
                    'salarie'        => $salarie,
                    'salarie_terrs'  => $territories,
                ];
            });

            return [
                'terrain'  => $terrain,
                'projet'   => $projet,
                'salaries' => $salaries->values(),
            ];
        });

        return response()->json($data);
    }

    public function fetchSalarieData($salarieId)
    {
        $salarie = Salarie::findOrFail($salarieId);

        // Load terrains directly assigned via salarie_ids JSON
        $terrains = Terrain::whereIn('id', $salarie->terrain_ids ?? [])->get();

        $today = now()->startOfDay();
        $wsData = WsTechData::where('salarie_id', $salarieId)
            ->where('recorded_at', '>=', $today)
            ->get();

        return response()->json([
            'salarie'  => $salarie,
            'terrains' => $terrains,
            'wsData'   => $wsData,
        ]);
    }

    public function updateProjetSalaries(Request $request)
    {
        $validated = $request->validate([
            'projet_id' => 'required|exists:projets,id',
            'name' => 'required|string',
            'salarie_ids' => 'required|array',
            'salarie_ids.*' => 'exists:salaries,id',
        ]);

        $projet = Projet::where('id', $validated['projet_id'])
                        ->where('nom', $validated['name'])
                        ->first();

        if (!$projet) {
            return redirect()->back()->with('error', 'Projet not found or name mismatch.');
        }

        // 1. Assign the salarie_ids to the projet (if needed)
        $projet->salarie_ids = $validated['salarie_ids'];
        $projet->save();

        // 2. Add this projet ID to each selected salarie's projet_ids (if not already present)
        \App\Models\Salarie::whereIn('id', $validated['salarie_ids'])->get()->each(function ($salarie) use ($projet) {
            $currentProjetIds = is_array($salarie->projet_ids) ? $salarie->projet_ids : [];

            // Avoid duplicates
            if (!in_array($projet->id, $currentProjetIds)) {
                $currentProjetIds[] = $projet->id;
                $salarie->projet_ids = $currentProjetIds;
                $salarie->save();
            }
        });

        return redirect()->back()->with('success', 'Projet and salaries updated successfully.');
    }




    public function createTerrain(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string',
            'description' => 'nullable|string',
            'points'      => 'required|array',
            'surface'     => 'nullable|numeric',
            'radius'      => 'nullable|numeric',
            'projet_id'   => 'required|exists:projets,id',
            'salarie_ids' => 'nullable|array',
        ]);

        // Create the terrain
        $terrain = Terrain::create($validated);

        // Add terrain ID to the project's terrain_ids
        $projet = Projet::find($validated['projet_id']);
        if ($projet) {
            // 1. Add terrain to projet
            $projet->terrain_ids = array_unique(array_merge($projet->terrain_ids ?? [], [$terrain->id]));

            // 2. If salarie_ids provided, also update projet.salarie_ids
            if (!empty($validated['salarie_ids'])) {
                $projet->salarie_ids = array_unique(array_merge($projet->salarie_ids ?? [], $validated['salarie_ids']));
            }

            $projet->save();
        }

        // 3. Handle salarie_ids (if any)
        if (!empty($validated['salarie_ids'])) {
            foreach ($validated['salarie_ids'] as $salarieId) {
                $salarie = Salarie::find($salarieId);
                if ($salarie) {
                    // Add terrain ID to salarie
                    $salarie->terrain_ids = array_unique(array_merge($salarie->terrain_ids ?? [], [$terrain->id]));

                    // Optionally also link the project to the salarie
                    $salarie->projet_ids = array_unique(array_merge($salarie->projet_ids ?? [], [$validated['projet_id']]));

                    $salarie->save();
                }
            }

            // 4. Add salarie_ids to the terrain itself
            $terrain->salarie_ids = $validated['salarie_ids'];
            $terrain->save();
        }

        return redirect()->back()->with('success', 'Terrain created');
    }


    public function editTerrain(Request $request, $id)
    {
        $terrain = Terrain::findOrFail($id);
        $validated = $request->validate([
            'name'        => 'sometimes|string',
            'description' => 'nullable|string',
            'points'      => 'sometimes|array',
            'surface'     => 'nullable|numeric',
            'radius'      => 'nullable|numeric',
            'salarie_ids' => 'nullable|array',
        ]);

        $terrain->update($validated);

        return redirect()->back()->with('success', 'Terrain updated');
    }

   public function deleteTerrain($id)
    {
        $terrain = Terrain::findOrFail($id);

        // Remove terrain ID from each associated Salarie
        if (!empty($terrain->salarie_ids)) {
            foreach ($terrain->salarie_ids as $salarieId) {
                $salarie = Salarie::find($salarieId);
                if ($salarie) {
                    $salarie->terrain_ids = array_values(array_diff($salarie->terrain_ids, [$terrain->id]));
                    $salarie->save();
                }
            }
        }

        // Remove terrain ID from the associated Projet
        if ($terrain->projet_id) {
            $projet = Projet::find($terrain->projet_id);
            if ($projet) {
                $projet->terrain_ids = array_values(array_diff($projet->terrain_ids, [$terrain->id]));
                $projet->save();
            }
        }

        // Delete the terrain
        $terrain->delete();

        return redirect()->back()->with('success', 'Terrain deleted');
    }


    

    public function affectGrantSalarie(Request $request)
    {
        $request->validate([
            'salarie_id' => 'required|exists:salaries,id',
            'terrain_id' => 'required|exists:terrains,id',
        ]);

        try {
            $salarie = Salarie::findOrFail($request->salarie_id);
            $terrain = Terrain::findOrFail($request->terrain_id);

            // Get current salarie_ids from terrain
            $terrainSalarieIds = $terrain->salarie_ids ?? [];
            if (is_string($terrainSalarieIds)) {
                $terrainSalarieIds = json_decode($terrainSalarieIds, true) ?? [];
            } elseif (!is_array($terrainSalarieIds)) {
                $terrainSalarieIds = [];
            }

            // Get current terrain_ids from salarie
            $salarieTerrainIds = $salarie->terrain_ids ?? [];
            if (is_string($salarieTerrainIds)) {
                $salarieTerrainIds = json_decode($salarieTerrainIds, true) ?? [];
            } elseif (!is_array($salarieTerrainIds)) {
                $salarieTerrainIds = [];
            }

            // Toggle assignment
            $alreadyAssigned = in_array($salarie->id, $terrainSalarieIds);

            if ($alreadyAssigned) {
                // Unassign
                $terrainSalarieIds = array_values(array_filter($terrainSalarieIds, fn($id) => $id !== $salarie->id));
                $salarieTerrainIds = array_values(array_filter($salarieTerrainIds, fn($id) => $id !== $terrain->id));
            } else {
                // Assign
                $terrainSalarieIds[] = $salarie->id;
                $salarieTerrainIds[] = $terrain->id;
            }

            // Save both sides
            $terrain->salarie_ids = $terrainSalarieIds;
            $terrain->save();

            $salarie->terrain_ids = $salarieTerrainIds;
            $salarie->save();

           return redirect()->back()->with('success', 'tech updated');
        } catch (\Exception $e) {
            Log::error('Error toggling salarie/terrain assignment: ' . $e->getMessage());

            return redirect()->back()->with('error', 'tech not updated');
        }
    }

    

    public function deactivateNotif($id)
    {
        $disponibility = Notification::findOrFail($id);

        // Switch statut to inactive
        $disponibility->update([
            'statut' => 'inactive',
        ]);

        return redirect()->back()->with('success', 'Disponibility marked as inactive.');
    }


    ######################################################
    public function Planing()
    {
        return Inertia::render('suivi-controle/Planings');

    }

    public function fetchDataPlanings()
    {
        $plans = Plan::with('projet')->latest()->get();
        $terrains = Terrain::all();
        $projets  = Projet::all();
        $salaries = Salarie::where('statut', 'actif')->get();
        $allProfils = Profil::all();

        // Map each salarie to their profils manually
        $salaries->transform(function ($salarie) use ($allProfils) {
            $salarie->profils = $allProfils
                ->where('user_id', $salarie->id)
                ->values() // reset array indices
                ->map(function ($profil) {
                    // Optional: transform profil object as needed
                    return [
                        'id' => $profil->id,
                        'nom_profil' => $profil->nom_profil,
                        'poste_profil' => $profil->poste_profil,
                    ];
                });
            return $salarie;
        });

       $mssgs = Notification::where('receiver', 'suivi-controle')
        ->where('statut', 'actif')
        ->get();

        return response()->json(compact('plans','terrains', 'projets', 'salaries','mssgs'));
    }

    public function createPlan(Request $request)
    {
        $validated = $request->validate([
            'projet_id' => 'required|exists:projets,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'mssg' => 'nullable|string',
            'description' => 'nullable|string',
            'terrains_ids' => 'nullable|array',
            'terrains_ids.*' => 'integer|exists:terrains,id',
            'salarie_ids' => 'nullable|array',
            'salarie_ids.*' => 'integer|exists:salaries,id',
            'statut' => 'required|string',
        ]);

        $plan = Plan::create([
            'projet_id' => $validated['projet_id'],
            'date_debut' => $validated['date_debut'],
            'date_fin' => $validated['date_fin'],
            'mssg' => $validated['mssg'] ?? null,
            'description' => $validated['description'] ?? null,
            'terrains_ids' => $validated['terrains_ids'] ?? [],
            'salarie_ids' => $validated['salarie_ids'] ?? [],
            'statut' => $validated['statut'],
        ]);

        return redirect()->back()->with('success', 'Plan créé avec succès');
    }


    public function updatePlan(Request $request, $id)
    {
        $validated = $request->validate([
            'projet_id' => 'required|exists:projets,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'mssg' => 'nullable|string',
            'description' => 'nullable|string',
            'terrains_ids' => 'nullable|array',
            'terrains_ids.*' => 'integer|exists:terrains,id',
            'salarie_ids' => 'nullable|array',
            'salarie_ids.*' => 'integer|exists:salaries,id',
            'statut' => 'required|string',
        ]);

        $plan = Plan::findOrFail($id);

        $plan->update([
            'projet_id' => $validated['projet_id'],
            'date_debut' => $validated['date_debut'],
            'date_fin' => $validated['date_fin'],
            'mssg' => $validated['mssg'] ?? null,
            'description' => $validated['description'] ?? null,
            'terrains_ids' => $validated['terrains_ids'] ?? [],
            'salarie_ids' => $validated['salarie_ids'] ?? [],
            'statut' => $validated['statut'],
        ]);

        return redirect()->back()->with('success', 'Plan mis à jour avec succès');
    }


    public function deletePlan($id)
    {
        $plan = Plan::findOrFail($id);
        $plan->delete();

         return redirect()->back()->with('success', 'Plan Deleted');
    }
    ######################################################

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
