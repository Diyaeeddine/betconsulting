<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Projet;
use App\Models\Plan;
use App\Models\Salarie;
use App\Models\Terrain;
use App\Models\WsTechData;
use Illuminate\Support\Str;

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

        // 2. Create Projects
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
                'terrain_ids' => [], // No terrain IDs initially
                'salarie_ids' => [], // No salaried employees linked
            ]));
        }

        // 3. Create Salaries
        for ($j = 1; $j <= 10; $j++) {
            $place = (rand(0, 1) === 1) ? 'terrain' : 'bureau';

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
                'projet_ids' => [],
                'password' => bcrypt('password'),
            ]);

            $salaries->push($sal);
        }

        // 4. Create Terrains and link them to Projects
        foreach ($projects as $project) {
            // Create 2 terrains for each project
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
                    'projet_id' => $project->id, // Link terrain to project
                    'statut_tech' => 'en_cours', // Valid enum value
                    'statut_final' => 'en_revision', // Valid enum value
                    'salarie_ids' => [],
                ]));
            }
        }

        // 5. Create Plans for each Project (2 Plans per Project)
        foreach ($projects as $project) {
            for ($p = 1; $p <= 2; $p++) {
                $plans->push(Plan::create([
                    'date' => now()->addDays(rand(1, 30)), // Random date within next 30 days
                    'mssg' => "Plan #$p for Projet {$project->nom}",
                    'description' => "Plan description for Plan #$p of Projet {$project->nom}",
                    'terrains_ids' => json_encode([$terrains->random()->id, $terrains->random()->id]), // Random terrains
                    'salarie_ids' => json_encode([$salaries->random()->id, $salaries->random()->id]), // Random salaries
                    'statut' => 'en_cours', // Valid enum value
                    'projet_id' => $project->id, // Link plan to project
                ]));
            }
        }

        // Optionally log success
        $this->command->info('5 projects, 10 salaries, 10 terrains (2 per project), and 10 plans (2 per project) have been seeded.');
    }
}