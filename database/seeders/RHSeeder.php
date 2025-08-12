<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

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
        // Ensure a User exists
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Enum values for profils (example)
        $profilTypes = [
            'ingenieur_structure',
            'ingenieur_genie_civil',
            'ingenieur_electricite_fluides',
            'dessinateur_projeteur',
            'ingenieur_bim',
            'chef_de_chantier',
            'conducteur_de_travaux',
            'techniciens_ouvriers_specialises',
            'technicien_specialise',
            'responsable_hse',
            'controleur_technique',
            'metreur_economiste',
            'geometre_topographe',
            'responsable_achats',
            'gestionnaire_contrats',
        ];

        // Create 3 projets
        for ($i = 1; $i <= 3; $i++) {
            $projet = Projet::create([
                'nom' => "Projet $i",
                'description' => "Description du projet $i",
                'budget_total' => 100000 + $i * 10000,
                'budget_utilise' => 20000 + $i * 5000,
                'date_debut' => now()->subMonths($i * 3)->toDateString(),
                'date_fin' => now()->addMonths($i * 3)->toDateString(),
                'statut' => 'en_cours',
                'client' => "Client $i",
                'lieu_realisation' => "Ville $i",
                'latitude' => 35.689487 + ($i * 0.01),
                'longitude' => -5.799999 + ($i * 0.01),
                'radius' => 5 + $i,
                'responsable_id' => $user->id,
                'type_projet' => 'etude',
            ]);

            // Create 4 salariés affectés to the project
            for ($j = 1; $j <= 4; $j++) {
                $email = "salarie{$j}_projet{$i}@exemple.com";

                // Create Salarie WITHOUT 'poste'
                $salarie = Salarie::create([
                    'nom' => "Nom $j",
                    'prenom' => "Prénom $j",
                    'email' => $email,
                    'telephone' => "060000000$j",
                    'salaire_mensuel' => 3000 + $j * 500,
                    'date_embauche' => now()->subYears($j)->toDateString(),
                    'statut' => 'actif',
                    'projet_id' => $projet->id,
                ]);

                // Create one Profil per salarie with random type_profil
                Profil::create([
                    'user_id' => $salarie->id,
                    'nom_profil' => "Profil Exemple $j",
                    'type_profil' => $profilTypes[array_rand($profilTypes)],
                ]);

                // Optionally, create multiple profils per salarie here if needed

                // Create 1 vehicle affected to the salarie or not
                if (rand(0, 1)) {
                    Vehicule::create([
                        'modele' => "Modèle $j",
                        'matricule' => "MATRICULE{$j}{$i}",
                        'marque' => "Marque $j",
                        'type' => 'voiture',
                        'etat' => 'disponible',
                        'cout_location_jour' => 50.00,
                        'date_affectation' => now()->subDays(10)->toDateString(),
                        'date_disponibilite' => now()->addDays(20)->toDateString(),
                        'duree_affectation' => 30,
                        'salarie_id' => $salarie->id,
                        'duree_location' => 0,
                    ]);
                } else {
                    Vehicule::create([
                        'modele' => "Modèle $j",
                        'matricule' => "MATRICULE_NOAFFECT{$j}{$i}",
                        'marque' => "Marque $j",
                        'type' => 'voiture',
                        'etat' => 'disponible',
                        'cout_location_jour' => 50.00,
                        'date_affectation' => null,
                        'date_disponibilite' => null,
                        'duree_affectation' => null,
                        'salarie_id' => null,
                        'duree_location' => 0,
                    ]);
                }

                // Create 2 matériels affected to the salarie
                for ($k = 1; $k <= 2; $k++) {
                    Materiel::create([
                        'nom' => "Materiel $k",
                        'type' => 'type' . $k,
                        'etat' => 'disponible',
                        'cout_location_jour' => 30.00,
                        'date_acquisition' => now()->subYears(1)->toDateString(),
                        'duree_location' => 0,
                        'salarie_id' => $salarie->id,
                    ]);
                }
            }

            // Create 5 matériels non affectés
            for ($m = 1; $m <= 5; $m++) {
                Materiel::create([
                    'nom' => "Materiel Non Affecté $m",
                    'type' => 'type' . $m,
                    'etat' => 'disponible',
                    'cout_location_jour' => 25.00,
                    'date_acquisition' => now()->subYears(2)->toDateString(),
                    'duree_location' => 0,
                    'salarie_id' => null,
                ]);
            }

            // Create 5 véhicules non affectés
            for ($v = 1; $v <= 5; $v++) {
                Vehicule::create([
                    'modele' => "Modèle Non Affecté $v",
                    'matricule' => "MATRICULE_NOAFFECT_V{$v}{$i}",
                    'marque' => "Marque $v",
                    'type' => 'voiture',
                    'etat' => 'disponible',
                    'cout_location_jour' => 45.00,
                    'date_affectation' => null,
                    'date_disponibilite' => null,
                    'duree_affectation' => null,
                    'salarie_id' => null,
                    'duree_location' => 0,
                ]);
            }

            // Create 6 dépenses linked to the project
            for ($d = 1; $d <= 6; $d++) {
                Depense::create([
                    'projet_id' => $projet->id,
                    'type' => ['technique', 'vehicule', 'materiel', 'autre'][array_rand(['technique', 'vehicule', 'materiel', 'autre'])],
                    'user_id' => $user->id,
                    'item' => json_encode([
                        'note' => "Note de dépense $d",
                        'image' => "image$d.jpg",
                        'price' => rand(100, 1000)
                    ]),
                    'statut' => 'valide',
                ]);
            }
        }
    }
}
