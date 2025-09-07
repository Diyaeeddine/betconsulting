<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Projet;
use App\Models\Salarie;
use App\Models\Terrain;
use App\Models\WsTechData;
use Illuminate\Support\Str;


class RHSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );

        $projects = collect();
        $salaries = collect();
        $terrainsAll = collect();

        // 1. Create Projects
        for ($i = 1; $i <= 5; $i++) {
            $projects->push(Projet::create([
                'nom' => "Projet $i",
                'description' => "Description for project $i",
                'budget_total' => 100000 + 10000 * $i,
                'budget_utilise' => 20000 + 5000 * $i,
                'date_debut' => now()->subMonths($i * 2),
                'date_fin' => now()->addMonths($i * 4),
                'statut' => 'en_cours',
                'client' => "Client $i",
                'lieu_realisation' => Str::random(10),
                'responsable_id' => $user->id,
                'type_projet' => ['suivi', 'etude', 'controle'][array_rand(['suivi', 'etude', 'controle'])],
                'latitude' => 35.7 + ($i * 0.01),
                'longitude' => -5.8 + ($i * 0.01),
                'radius' => 5 + $i,
                'terrain_ids' => [],
                'salarie_ids' => [],
            ]));
        }

        // 2. Create Salaries
        for ($j = 1; $j <= 10; $j++) {
            $place = (rand(0, 1) === 1) ? 'terrain' : 'bureau';
            $assignedProjectIds = $projects->random(1)->pluck('id')->toArray();

            $sal = Salarie::create([
                'nom' => "Nom $j",
                'prenom' => "Prénom $j",
                'email' => "sal$j@example.com",
                'telephone' => '06' . rand(10000000, 99999999),
                'salaire_mensuel' => 3000 + 100 * $j,
                'date_embauche' => now()->subYears(rand(0, 3)),
                'statut' => 'actif',
                'emplacement' => $place,
                'terrain_ids' => [],
                'projet_ids' => $assignedProjectIds,
                'password' => bcrypt('password'),
            ]);

            $salaries->push($sal);

            // Link salary to project and vice versa
            foreach ($assignedProjectIds as $pid) {
                $proj = $projects->firstWhere('id', $pid);
                $proj->salarie_ids = array_unique(array_merge($proj->salarie_ids, [$sal->id]));
                $proj->save();
            }
        }

        // 3. Create Terrains per Project and assign to 'terrain' salaries
        foreach ($projects as $proj) {
            $terrainIds = [];

            for ($t = 1; $t <= 3; $t++) {
                $baseLat = $proj->latitude + ($t * 0.001);
                $baseLng = $proj->longitude + ($t * 0.001);

                // Create polygon with 4 points
                $poly = [
                    ['lat' => $baseLat, 'lng' => $baseLng],
                    ['lat' => $baseLat + 0.0005, 'lng' => $baseLng],
                    ['lat' => $baseLat + 0.0005, 'lng' => $baseLng + 0.0005],
                    ['lat' => $baseLat, 'lng' => $baseLng + 0.0005],
                ];

                $terrain = Terrain::create([
                    'name' => "Terrain $t Project {$proj->id}",
                    'description' => "Terrain $t of project {$proj->id}",
                    'points' => $poly,
                    'surface' => rand(100, 500),
                    'radius' => 50 + $t * 10,
                    'salarie_ids' => [],
                    'statut_tech' => 'en_cours',
                    'statut_final' => 'en_cours',
                    'projet_id' => $proj->id,
                ]);

                $terrainsAll->push($terrain);
                $terrainIds[] = $terrain->id;

                // Assign terrain to up to 2 eligible 'terrain' salaries in the same project
                $eligible = $salaries->filter(fn($s) =>
                    $s->emplacement === 'terrain' &&
                    in_array($proj->id, $s->projet_ids)
                );

                foreach ($eligible->random(min($eligible->count(), 2)) as $es) {
                    // Link terrain to salary
                    $terrain->salarie_ids = array_unique([...$terrain->salarie_ids, $es->id]);
                    $terrain->save();

                    // Link salary to terrain
                    $es->terrain_ids = array_unique([...$es->terrain_ids, $terrain->id]);
                    $es->save();
                }
            }

            // Link terrain IDs back to project
            $proj->terrain_ids = $terrainIds;
            $proj->save();
        }

        // 4. Seed WS data for terrain salaries
        foreach ($salaries->where('emplacement', 'terrain') as $sal) {
            for ($k = 0; $k < 3; $k++) {
                WsTechData::create([
                    'salarie_id' => $sal->id,
                    'recorded_at' => now()->subMinutes($k * 5),
                    'lat' => 35.6 + rand(0, 100) / 1000,
                    'long' => -5.7 + rand(0, 100) / 1000,
                    'alt' => rand(10, 100),
                ]);
            }
        }
    }
}
