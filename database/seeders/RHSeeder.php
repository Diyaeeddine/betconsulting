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
        // Récupérer ou créer un user admin
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
                'latitude' => 35.689487 + ($i * 0.01),
                'longitude' => -5.799999 + ($i * 0.01),
                'radius' => 5 + $i,
                'responsable_id' => $user->id,
                'type_projet' => 'etude',
            ]);

            // Créer 4 salariés par projet
            for ($j = 1; $j <= 4; $j++) {
                $email = "salarie{$j}_projet{$i}@exemple.com";

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

                // Créer 1 véhicule affecté au salarié ou non, avec statut achat ou location
                $statut = ['achete', 'loue'][array_rand(['achete', 'loue'])];

                $vehiculeData = [
                    'modele' => "Modèle $j",
                    'matricule' => $statut === 'achete' ? "ACHAT{$j}{$i}" : "LOUE{$j}{$i}",
                    'marque' => "Marque $j",
                    'type' => 'voiture',
                    'etat' => 'disponible',
                    'salarie_id' => rand(0,1) ? $salarie->id : null,
                    'date_affectation' => rand(0,1) ? now()->subDays(rand(1,30))->toDateString() : null,
                    'date_disponibilite' => rand(0,1) ? now()->addDays(rand(10,60))->toDateString() : null,
                    'duree_affectation' => rand(0,1) ? rand(1,90) : null,
                ];

                if ($statut === 'achete') {
                    // Champs achat
                    $vehiculeData['statut'] = 'achete';
                    $vehiculeData['date_achat'] = now()->subMonths(rand(1,24))->toDateString();
                    $vehiculeData['type_paiement'] = ['espece', 'credit'][array_rand(['espece', 'credit'])];
                    $vehiculeData['cout_location_jour'] = null;
                    $vehiculeData['duree_location'] = null;
                    $vehiculeData['date_debut_location'] = null;
                    $vehiculeData['date_fin_location'] = null;
                    $vehiculeData['cout_location'] = null;

                    if ($vehiculeData['type_paiement'] === 'credit') {
                        $vehiculeData['montant_credit_total'] = 20000 + rand(0,10000);
                        $vehiculeData['montant_credit_mensuel'] = 500 + rand(0,300);
                        $vehiculeData['duree_credit_mois'] = rand(12,48);
                        $vehiculeData['date_debut_credit'] = now()->subMonths(rand(1,24))->toDateString();
                    } else {
                        $vehiculeData['montant_credit_total'] = null;
                        $vehiculeData['montant_credit_mensuel'] = null;
                        $vehiculeData['duree_credit_mois'] = null;
                        $vehiculeData['date_debut_credit'] = null;
                    }
                } else {
                    // Champs location
                    $vehiculeData['statut'] = 'loue';
                    $vehiculeData['cout_location_jour'] = 50.00 + rand(0,20);
                    $vehiculeData['duree_location'] = rand(1,12);
                    $vehiculeData['date_debut_location'] = now()->subDays(rand(1,30))->toDateString();
                    $vehiculeData['date_fin_location'] = now()->addDays(rand(30,90))->toDateString();

                    // Champs achat null
                    $vehiculeData['date_achat'] = null;
                    $vehiculeData['type_paiement'] = null;
                    $vehiculeData['montant_credit_total'] = null;
                    $vehiculeData['montant_credit_mensuel'] = null;
                    $vehiculeData['duree_credit_mois'] = null;
                    $vehiculeData['date_debut_credit'] = null;
                }

                Vehicule::create($vehiculeData);

                // Créer 2 matériels affectés
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

            // Matériels non affectés
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

            // Véhicules non affectés
            for ($v = 1; $v <= 5; $v++) {
                Vehicule::create([
                    'modele' => "Modèle Non Affecté $v",
                    'matricule' => "MATRICULE_NOAFFECT_V{$v}{$i}",
                    'marque' => "Marque $v",
                    'type' => 'voiture',
                    'etat' => 'disponible',
                    'statut' => ['achete', 'loue'][array_rand(['achete', 'loue'])],
                    'cout_location_jour' => 40.00,
                    'date_affectation' => null,
                    'date_disponibilite' => null,
                    'duree_affectation' => null,
                    'salarie_id' => null,
                    'duree_location' => 0,
                    'date_achat' => null,
                    'type_paiement' => null,
                    'montant_credit_total' => null,
                    'montant_credit_mensuel' => null,
                    'duree_credit_mois' => null,
                    'date_debut_credit' => null,
                    'date_debut_location' => null,
                    'date_fin_location' => null,
                    'cout_location' => null,
                ]);
            }

            // Dépenses
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
