<?php


namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Projet;
use App\Models\Plan;
use App\Models\Salarie;
use App\Models\Terrain;
use App\Models\Vehicule;
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
        $vehicules = collect();

        // === 2. Create 2 Projects ===
        for ($i = 1; $i <= 2; $i++) {
            $projects->push(Projet::create([
                'nom' => "Projet $i",
                'description' => "Description for Projet $i",
                'budget_total' => 200000 + 50000 * $i,
                'budget_utilise' => 50000,
                'date_debut' => Carbon::create(2025, 1, 1),
                'date_fin' => Carbon::create(2025, 12, 31),
                'statut' => 'en_cours',
                'client' => "Client $i",
                'lieu_realisation' => 'Maroc',
                'responsable_id' => $user->id,
                'type_projet' => ['suivi', 'etude', 'controle'][array_rand(['suivi', 'etude', 'controle'])],
                'latitude' => 34.0 + ($i * 0.05),
                'longitude' => -6.8 + ($i * 0.05),
                'radius' => 10 + $i,
                'terrain_ids' => [],
                'salarie_ids' => [],
                'rh_needs' => [],
            ]));
        }

        // === 3. Create 6 Salaries (3 per project) ===
        foreach ($projects as $index => $projet) {
            for ($j = 1; $j <= 3; $j++) {
                $salarie = Salarie::create([
                    'nom' => "Nom {$j}_P{$projet->id}",
                    'prenom' => "Prénom {$j}_P{$projet->id}",
                    'email' => "sal{$j}p{$projet->id}@example.com",
                    'telephone' => '06' . rand(10000000, 99999999),
                    'salaire_mensuel' => 3500 + rand(100, 300),
                    'date_embauche' => now()->subYears(rand(1, 5)),
                    'statut' => 'actif',
                    'emplacement' => rand(0, 1) ? 'terrain' : 'bureau',
                    'terrain_ids' => [],
                    'projet_ids' => [$projet->id],
                    'password' => bcrypt('password'),
                ]);

                $salaries->push($salarie);
            }
        }

        // === 4. Create 6 Terrains (3 per project) ===
        foreach ($projects as $projet) {
            for ($t = 1; $t <= 3; $t++) {
                $points = [
                    ['lat' => 33.5 + $t * 0.01, 'lng' => -7.6 + $t * 0.01],
                    ['lat' => 33.6 + $t * 0.01, 'lng' => -7.5 + $t * 0.01],
                    ['lat' => 33.7 + $t * 0.01, 'lng' => -7.4 + $t * 0.01],
                    ['lat' => 33.8 + $t * 0.01, 'lng' => -7.3 + $t * 0.01],
                ];

                $terrain = Terrain::create([
                    'name' => "Terrain $t - Projet {$projet->id}",
                    'description' => "Terrain description $t for Projet {$projet->id}",
                    'points' => $points,
                    'surface' => rand(1000, 5000),
                    'radius' => rand(10, 30),
                    'projet_id' => $projet->id,
                    'statut_tech' => 'en_cours',
                    'statut_final' => 'en_cours',
                    'salarie_ids' => [],
                ]);

                $terrains->push($terrain);
            }
        }

        // === 5. Create 4 Vehicules (2 per project) ===
        foreach ($projects as $projet) {
            $projectSalaries = $salaries->whereIn('projet_ids', [[$projet->id]])->values();

            for ($v = 1; $v <= 2; $v++) {
                $vehicule = Vehicule::create([
                    'modele' => "Modèle $v - P{$projet->id}",
                    'matricule' => strtoupper(Str::random(6)) . rand(100, 999),
                    'marque' => ['Toyota', 'Ford', 'Isuzu', 'Mercedes'][array_rand(['Toyota', 'Ford', 'Isuzu', 'Mercedes'])],
                    'type' => ['camion', 'voiture', 'engine'][array_rand(['camion', 'voiture', 'engine'])],
                    'etat' => 'disponible',
                    'cout_location_jour' => rand(100, 300),
                    'date_debut_location' => now()->subDays(rand(5, 30)),
                    'date_fin_location' => now()->addDays(rand(30, 90)),
                    'cout_location' => rand(2000, 10000),
                    'duree_location' => rand(10, 90),
                    'date_affectation' => now(),
                    'date_disponibilite' => now()->addDays(rand(10, 60)),
                    'duree_affectation' => rand(10, 60),
                    'salarie_id' => $projectSalaries->random()->id,
                    'statut' => 'loue',
                    'date_achat' => null,
                    'type_paiement' => null,
                ]);

                $vehicules->push($vehicule);
            }
        }

        // === 6. Create 10 Plans per Project ===
        foreach ($projects as $projet) {
            $projectSalaries = $salaries->whereIn('projet_ids', [[$projet->id]])->values();
            $projectTerrains = $terrains->where('projet_id', $projet->id)->values();
            $startBase = Carbon::create(2025, 1, 1);

            for ($p = 1; $p <= 10; $p++) {
                $startDate = $startBase->copy()->addDays($p * 7);
                $endDate = $startDate->copy()->addDays(15);

                $plans->push(Plan::create([
                    'date_debut' => $startDate,
                    'date_fin' => $endDate,
                    'mssg' => "Plan $p for Projet {$projet->id}",
                    'description' => "This is plan #$p for Projet {$projet->id}",
                    'terrains_ids' => $projectTerrains->random(rand(1, 2))->pluck('id')->values()->toArray(),
                    'salarie_ids' => $projectSalaries->random(rand(1, 2))->pluck('id')->values()->toArray(),
                    'statut' => 'en_cours',
                    'projet_id' => $projet->id,
                ]));
            }
        }

        $this->command->info('✅ Seeded: 2 projets, 6 salaries, 6 terrains, 4 vehicules, 20 plans');
    }
}
