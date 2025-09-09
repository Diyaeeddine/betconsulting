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

        // 1. Create Projects (without linking to any salaries)
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
                'terrain_ids' => [], // No terrain IDs
                'salarie_ids' => [], // No salaried employees linked
            ]));
        }

        // 2. Create Salaries (without linking to any projects or terrains)
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
                'terrain_ids' => [], // No terrain IDs
                'projet_ids' => [], // No project IDs
                'password' => bcrypt('password'),
            ]);

            $salaries->push($sal);
        }

        // Optionally log success
        $this->command->info('5 projects and 10 salaries have been seeded.');
    }
}