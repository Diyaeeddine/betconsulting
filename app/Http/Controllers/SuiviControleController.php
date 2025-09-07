<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

use App\Models\Salarie;
use App\Models\Terrain;
use App\Models\Projet;

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
        $salaries = Salarie::where('emplacement', 'terrain')->get();

        return response()->json(compact('terrains', 'projets', 'salaries'));
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

    public function updateStatusTerrs(Request $request)
    {
        $validated = $request->validate([
            'terrains'               => 'required|array',
            'terrains.*.id'          => 'required|exists:terrains,id',
            'terrains.*.statut_tech' => 'required|in:validé,terminé,en_cours,en_revision',
            'terrains.*.statut_final' => 'required|in:validé,terminé,en_cours,en_revision',
        ]);

        foreach ($validated['terrains'] as $data) {
            Terrain::where('id', $data['id'])->update([
                'statut_tech'  => $data['statut_tech'],
                'statut_final' => $data['statut_final'],
            ]);
        }

        return redirect()->back()->with('success', 'Terrain Updated');
    }

    public function store_ws_data(Request $request)
    {
        $data = $request->validate([
            'salarie_id'  => 'required|exists:salaries,id',
            'lat'         => 'required|numeric',
            'long'        => 'required|numeric',
            'alt'         => 'nullable|numeric',
            'recorded_at' => 'required|date',
        ]);

        $record = WsTechData::create($data);

        // Broadcast the event
        event(new WsTechDataReceived($record->toArray()));

        return response()->json([
            'status' => 'ok',
            'data'   => $record,
        ]);
    }
}
