<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Projet;
use App\Models\Plan;
use App\Models\Salarie;
use App\Models\Terrain;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RHSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );

        $projects = collect();
        $salaries = collect();
        $terrains = collect();
        $plans = collect();

        // 2. Create 3 Projects
        for ($i = 1; $i <= 3; $i++) {
            $projects->push(Projet::create([
                'nom' => "Projet $i",
                'description' => "Description for project $i",
                'budget_total' => 100000 + 10000 * $i,
                'budget_utilise' => 20000 + 5000 * $i,
                'date_debut' => Carbon::create(2025, 1, 1),
                'date_fin' => Carbon::create(2025, 12, 31),
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
                'rh_needs' => json_encode([]),
            ]));
        }

        // 3. Create 10 Salaries
        for ($j = 1; $j <= 10; $j++) {
            $place = (rand(0, 1) === 1) ? 'terrain' : 'bureau';

            $salaries->push(Salarie::create([
                'nom' => "Nom $j",
                'prenom' => "Prénom $j",
                'email' => "sal$j@example.com",
                'telephone' => '06' . rand(10000000, 99999999),
                'salaire_mensuel' => 3000 + 100 * $j,
                'date_embauche' => now()->subYears(rand(0, 3)),
                'statut' => 'actif',
                'emplacement' => $place,
                'terrain_ids' => [],
                'projet_ids' => [],
                'password' => bcrypt('password'),
            ]));
        }

        // 4. Create 2 Terrains per Project
        foreach ($projects as $project) {
            for ($t = 1; $t <= 2; $t++) {
                $terrains->push(Terrain::create([
                    'name' => "Terrain $t for Projet {$project->nom}",
                    'description' => "Description terrain $t for Projet {$project->nom}",
                    'points' => json_encode([
                        ['lat' => 35.01 + $t * 0.01, 'lng' => -4.99 + $t * 0.01],
                        ['lat' => 35.02 + $t * 0.01, 'lng' => -4.98 + $t * 0.01],
                    ]),
                    'surface' => rand(1000, 5000),
                    'radius' => rand(10, 50),
                    'projet_id' => $project->id,
                    'statut_tech' => 'en_cours',
                    'statut_final' => 'en_revision',
                    'salarie_ids' => [],
                ]));
            }
        }

        // 5. Create 10 Plans per Project with intervals in 2025
        foreach ($projects as $projectIndex => $project) {
            $startBase = Carbon::create(2025, 1, 1);

            for ($p = 1; $p <= 10; $p++) {
                // Spread intervals from 1 day to ~200 days
                $interval = ($p * 20); // ~20, 40, ..., 200 days
                $startDate = $startBase->copy()->addDays($p * 5); // Slightly offset each plan
                $endDate = $startDate->copy()->addDays($interval);

                // Ensure end date stays in 2025
                if ($endDate->year > 2025) {
                    $endDate = Carbon::create(2025, 12, 31);
                }

                $plans->push(Plan::create([
                    'date_debut' => $startDate,
                    'date_fin' => $endDate,
                    'mssg' => "Plan #$p for Projet {$project->nom}",
                    'description' => "Description of Plan #$p for Projet {$project->nom}",
                    'terrains_ids' => json_encode([
                        $terrains->where('projet_id', $project->id)->random()->id
                    ]),
                    'salarie_ids' => json_encode([
                        $salaries->random()->id,
                        $salaries->random()->id,
                    ]),
                    'statut' => 'en_cours',
                    'projet_id' => $project->id,
                ]));
            }
        }

        // Final Info
        $this->command->info('3 projects, 10 salaries, 6 terrains, and 30 plans for 2025 have been seeded.');
    }
}
