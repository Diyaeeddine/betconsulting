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

class RHSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure at least 1 user exists
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin User', 'password' => bcrypt('password')]
        );

        $totalProjects = 6; // More projects for variety
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
                'salarie_ids'       => [], // Will be filled later
                'responsable_id'    => 7,
            ]));
        }

        // Step 2: Create salaries with multiple projects and passwords
        $salaries = collect();
        $profilsPostes = [
            [
                'value' => "bureau_etudes",
                'label' => "Bureau d'Études Techniques (BET)",
                'postes' => [
                    "Ingénieur structure (béton, acier, bois)",
                    "Ingénieur génie civil",
                    "Ingénieur électricité / électricité industrielle",
                    "Ingénieur thermique / énergétique",
                    "Ingénieur fluides (HVAC, plomberie, CVC)",
                    "Ingénieur géotechnique",
                    "Dessinateur projeteur / DAO (Autocad, Revit, Tekla)",
                    "Technicien bureau d’études",
                    "Chargé d’études techniques",
                    "Ingénieur environnement / développement durable",
                    "Ingénieur calcul de structures",
                    "Architecte"
                ],
            ],
            [
                'value' => "construction",
                'label' => "Construction",
                'postes' => [
                    "Chef de chantier",
                    "Conducteur de travaux",
                    "Ingénieur travaux / Ingénieur chantier",
                    "Conducteur d’engins",
                    "Chef d’équipe",
                    "Technicien travaux",
                    "Manœuvre / Ouvrier spécialisé",
                    "Coordinateur sécurité chantier (SST, prévention)",
                    "Métreur / Économiste de la construction"
                ],
            ],
            [
                'value' => "suivi_controle",
                'label' => "Suivi et Contrôle",
                'postes' => [
                    "Contrôleur technique",
                    "Chargé de suivi qualité",
                    "Chargé de suivi sécurité",
                    "Inspecteur de chantier",
                    "Responsable HSE (Hygiène, Sécurité, Environnement)",
                    "Technicien contrôle qualité",
                    "Planificateur / Chargé de planning",
                    "Responsable logistique chantier"
                ],
            ],
            [
                'value' => "support_gestion",
                'label' => "Support et Gestion",
                'postes' => [
                    "Responsable administratif chantier",
                    "Assistant de projet",
                    "Responsable achats / approvisionnement",
                    "Responsable qualité",
                    "Gestionnaire de contrats",
                    "Chargé de communication",
                    "Responsable financier / comptable chantier"
                ],
            ],
        ];

        for ($j = 1; $j <= $totalSalaries; $j++) {
            // Random projects for this salarie
            $assignedProjects = $projets->random(rand(1, 3))->pluck('id')->toArray();

            $salarie = Salarie::create([ // Used a variable to create the salarie
                'nom'               => "Nom $j",
                'prenom'            => "Prénom $j",
                'email'             => "salarie{$j}@example.com",
                'telephone'         => "06000000{$j}",
                'salaire_mensuel'   => 3000 + $j * 100,
                'date_embauche'     => now()->subYears(rand(0, 5))->toDateString(),
                'statut'            => 'actif',
                'projet_ids'        => $assignedProjects,
                'password'          => bcrypt('password123'), // Set password for the user
            ]);

            // Assign this salarie to these projects in reverse (fill salarie_ids in projects)
            foreach ($assignedProjects as $pId) {
                $proj = $projets->firstWhere('id', $pId);
                if ($proj) { // Check if project exists
                    $salarieIds = $proj->salarie_ids ?? [];
                    $salarieIds[] = $salarie->id; // Use the newly created salarie's id
                    $proj->salarie_ids = array_unique($salarieIds);
                    $proj->save();
                }
            }

            // Step 3: Assign ONE random profile to each salarie
            $randomProfilPoste = $profilsPostes[array_rand($profilsPostes)];
            $randomPoste = $randomProfilPoste['postes'][array_rand($randomProfilPoste['postes'])];

            Profil::create([
                'user_id'    => $salarie->id,
                'nom_profil' => $randomProfilPoste['value'],
                'poste_profil' => $randomPoste,
            ]);
        }

        // Step 4: Create vehicles and materials for each salary
        foreach ($salaries as $salarie) {
            // Vehicles
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

            // Materials
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

        // Step 5: Create non-assigned vehicles & materials
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

        // Step 6: Create expenses for each project
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
