<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Projet;
use App\Models\Salarie;
use App\Models\Vehicule;
use App\Models\Materiel;
use App\Models\Depense;
use App\Models\Profil;
use App\Models\Terrain;
use App\Models\WsTechData;

class RHSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure at least 1 user exists
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin User', 'password' => bcrypt('password')]
        );

        $totalProjects = 6;
        $totalSalaries = 12;

        // Step 1: Create projects
        $projets = collect();
        for ($i = 1; $i <= $totalProjects; $i++) {
            $projets->push(Projet::create([
                'nom'               => "Projet $i",
                'description'       => "Description du projet $i",
                'budget_total'      => 100000 + $i * 10000,
                'budget_utilise'    => 20000 + $i * 5000,
                'date_debut'        => now()->subMonths($i * 2)->toDateString(),
                'date_fin'          => now()->addMonths($i * 4)->toDateString(),
                'statut'            => 'en_cours',
                'client'            => "Client $i",
                'lieu_realisation'  => "Ville $i",
                'latitude'          => 35.689487 + ($i * 0.01),
                'longitude'         => -5.799999 + ($i * 0.01),
                'radius'            => 5 + $i,
                'type_projet'       => ['suivi', 'etude', 'controle'][array_rand(['suivi', 'etude', 'controle'])],
                'salarie_ids'       => [],
                'terrain_ids'       => [],
                'responsable_id'    => $user->id,
            ]));
        }

        // Step 2: Create salaries
        $salaries = collect();
        $profilsPostes = [
            ['value' => "bureau_etudes", 'postes' => ["Ingénieur génie civil", "Architecte"]],
            ['value' => "construction", 'postes' => ["Chef de chantier", "Conducteur de travaux"]],
            ['value' => "suivi_controle", 'postes' => ["Contrôleur technique", "Inspecteur de chantier"]],
            ['value' => "support_gestion", 'postes' => ["Responsable administratif chantier", "Assistant de projet"]],
        ];

        for ($j = 1; $j <= $totalSalaries; $j++) {
            $assignedProjects = $projets->random(rand(1, 3))->pluck('id')->toArray();

            $salarie = Salarie::create([
                'nom'             => "Nom $j",
                'prenom'          => "Prénom $j",
                'email'           => "salarie{$j}@example.com",
                'telephone'       => "06000000{$j}",
                'salaire_mensuel' => 3000 + $j * 100,
                'date_embauche'   => now()->subYears(rand(0, 5))->toDateString(),
                'statut'          => 'actif',
                'emplacement'    => (rand(0, 1) ? 'bureau' : 'terrain'),
                'projet_ids'      => $assignedProjects,
                'terrain_ids'     => [],
                'password'        => bcrypt('password123'),
            ]);

            $salaries->push($salarie);

            foreach ($assignedProjects as $pId) {
                $proj = $projets->firstWhere('id', $pId);
                if ($proj) {
                    $proj->salarie_ids = array_unique(array_merge($proj->salarie_ids ?? [], [$salarie->id]));
                    $proj->save();
                }
            }

            // Assign profile
            $randomProfilPoste = $profilsPostes[array_rand($profilsPostes)];
            $randomPoste = $randomProfilPoste['postes'][array_rand($randomProfilPoste['postes'])];

            Profil::create([
                'user_id'     => $salarie->id,
                'nom_profil'  => substr($randomProfilPoste['value'], 0, 50), // prevent truncation
                'poste_profil'=> $randomPoste,
            ]);
        }

        // Step 3: Create terrains
        foreach ($projets as $projet) {
            for ($t = 1; $t <= 3; $t++) {
                Terrain::create([
                    'name'        => "Terrain {$t}_Projet{$projet->id}",
                    'description' => "Description terrain {$t} du projet {$projet->id}",
                    'long'        => $projet->longitude + ($t * 0.001),
                    'lat'         => $projet->latitude + ($t * 0.001),
                    'radius'      => 100 + $t * 20,
                    'projet_id'   => $projet->id,
                    'salarie_ids' => [],
                    'statut_tech' => 'en_cours',
                    'statut_final'=> 'en_cours',
                ]);
            }
        }

        // Step 4: Create random WS positions for salaries
        foreach ($salaries as $salarie) {
            for ($p = 0; $p < 3; $p++) {
                WsTechData::create([
                    'salarie_id' => $salarie->id,
                    'recorded_at'  => now()->subMinutes($p * 5),
                    'long'       => 35.6 + rand(0, 100) / 1000,
                    'lat'        => -5.7 + rand(0, 100) / 1000,
                    'alt'        => rand(10, 100),
                ]);
            }
        }

        // Step 5: Vehicles and materials
        foreach ($salaries as $salarie) {
            if (rand(0, 1)) {
                Vehicule::create([
                    'modele'            => "Modèle {$salarie->id}",
                    'matricule'         => "MATRICULE{$salarie->id}",
                    'marque'            => "Marque {$salarie->id}",
                    'type'              => 'voiture',
                    'etat'              => 'disponible',
                    'cout_location_jour'=> 50.00,
                    'date_affectation'  => now()->subDays(10)->toDateString(),
                    'date_disponibilite'=> now()->addDays(20)->toDateString(),
                    'duree_affectation' => 30,
                    'salarie_id'        => $salarie->id,
                    'duree_location'    => 0,
                ]);
            }

            for ($k = 1; $k <= 2; $k++) {
                Materiel::create([
                    'nom'               => "Materiel {$k}_Sal{$salarie->id}",
                    'type'              => 'type' . $k,
                    'etat'              => 'disponible',
                    'cout_location_jour'=> 30.00,
                    'date_acquisition'  => now()->subYears(1)->toDateString(),
                    'duree_location'    => 0,
                    'salarie_id'        => $salarie->id,
                ]);
            }
        }

        // Step 6: Non-assigned materials & vehicles
        for ($m = 1; $m <= 5; $m++) {
            Materiel::create([
                'nom'               => "Materiel Non Affecté $m",
                'type'              => 'type' . $m,
                'etat'              => 'disponible',
                'cout_location_jour'=> 25.00,
                'date_acquisition'  => now()->subYears(2)->toDateString(),
                'duree_location'    => 0,
                'salarie_id'        => null,
            ]);
        }
        for ($v = 1; $v <= 5; $v++) {
            Vehicule::create([
                'modele'            => "Modèle Non Affecté $v",
                'matricule'         => "MATRICULE_NOAFFECT_V{$v}",
                'marque'            => "Marque $v",
                'type'              => 'voiture',
                'etat'              => 'disponible',
                'cout_location_jour'=> 45.00,
                'date_affectation'  => null,
                'date_disponibilite'=> null,
                'duree_affectation' => null,
                'salarie_id'        => null,
                'duree_location'    => 0,
            ]);
        }

        // Step 7: Expenses for each project
        foreach ($projets as $projet) {
            for ($d = 1; $d <= 4; $d++) {
                Depense::create([
                    'projet_id' => $projet->id,
                    'type'      => ['technique', 'vehicule', 'materiel', 'autre'][array_rand(['technique', 'vehicule', 'materiel', 'autre'])],
                    'user_id'   => $user->id,
                    'item'      => json_encode([
                        'note'  => "Note de dépense $d pour projet {$projet->id}",
                        'image' => "image{$d}.jpg",
                        'price' => rand(100, 1000)
                    ]),
                    'statut'    => 'valide',
                ]);
            }
        }
    }
}
