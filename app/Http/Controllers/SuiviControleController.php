<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

use App\Models\Salarie;
use App\Models\Terrain;


use App\Models\WsTechData;
use App\Events\WsTechDataReceived;
use Illuminate\Http\Request;

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

    public function getTechs()
    {
        $techs = Salarie::where('emplacement', 'terrain')->get();

        $techs = $techs->map(function ($tech) {
            $terrains = Terrain::whereJsonContains('salarie_ids', $tech->id)->get();
            return [
                'tech' => $tech,
                'terrains' => $terrains,
            ];
        });

        return response()->json($techs);
    }

    /**
     * Get detailed info for a specific technician, including terrains and positions.
     */
    public function getTechInfo($id)
    {
        $salarie = Salarie::findOrFail($id);

        $terrains = Terrain::whereJsonContains('salarie_ids', $salarie->id)->get();
        $positions = WsTechData::where('salarie_id', $salarie->id)
            ->orderBy('recorded_at', 'desc')
            ->get();

        return response()->json([
            'salarie' => $salarie,
            'terrains' => $terrains,
            'positions' => $positions,
        ]);
    }


    /**
     * Toggle assignment of a technician to a terrain.
     */
    public function affectGrantTech(Request $request)
    {
        $request->validate([
            'salarie_id' => 'required|exists:salaries,id',
            'terrain_id' => 'required|exists:terrains,id',
        ]);

        $terrain = Terrain::findOrFail($request->terrain_id);
        $salarieId = (int) $request->salarie_id;

        $ids = $terrain->salarie_ids ?? [];

        if (in_array($salarieId, $ids)) {
            // remove
            $ids = array_values(array_diff($ids, [$salarieId]));
        } else {
            // add
            $ids[] = $salarieId;
        }

        $terrain->salarie_ids = $ids;
        $terrain->save();

        return response()->json([
            'message' => 'Updated successfully',
            'salarie_ids' => $terrain->salarie_ids,
        ]);
    }

    /**
     * Update statut_tech and statut_final of a terrain.
     */
    public function updateStatutTerr(Request $request)
    {
        $data = $request->validate([
            'terrains' => 'required|array',
            'terrains.*.id' => 'required|exists:terrains,id',
            'terrains.*.statut_tech' => 'required|in:validé,terminé,en_cours,en_revision',
            'terrains.*.statut_final' => 'required|in:validé,terminé,en_cours,en_revision',
        ]);

        $updated = [];

        foreach ($data['terrains'] as $terrainData) {
            $terrain = Terrain::findOrFail($terrainData['id']);
            $terrain->updateStatuses(
                $terrainData['statut_tech'],
                $terrainData['statut_final']
            );
            $updated[] = $terrain;
        }

        return response()->json([
            'message' => 'Statuses updated successfully',
            'terrains' => $updated,
        ]);
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
