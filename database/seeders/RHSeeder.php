<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Projet;
use App\Models\Salarie;
use App\Models\Vehicule;
use App\Models\Materiel;
use App\Models\Depense;
use App\Models\User;

class RHSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer un user existant ou en créer un pour responsable et dépenses
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Créer 3 projets
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
                'responsable_id' => $user->id,
                'type_projet' => 'etude',
            ]);

            // Créer 4 salariés affectés à ce projet
            for ($j = 1; $j <= 4; $j++) {
                $email = "salarie{$j}_projet{$i}@exemple.com"; // email unique

                $salarie = Salarie::create([
                    'nom' => "Nom $j",
                    'prenom' => "Prénom $j",
                    'poste' => "Poste $j",
                    'email' => $email,
                    'telephone' => "060000000$j",
                    'salaire_mensuel' => 3000 + $j * 500,
                    'date_embauche' => now()->subYears($j)->toDateString(),
                    'statut' => 'actif',
                    'projet_id' => $projet->id,
                ]);

                // Créer 1 véhicule affecté au salarié ou non
                if (rand(0,1)) {
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

                // Créer 2 matériels affectés au salarié
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

            // Créer 5 matériels non affectés
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

            // Créer 5 véhicules non affectés
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

            // Créer 6 dépenses liées au projet, avec user_id et item JSON
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
