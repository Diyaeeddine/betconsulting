<?php

// database/seeders/InnovationDashboardSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Projet;

class InnovationDashboardSeeder extends Seeder
{
    public function run()
    {
        // Nettoyer les données existantes
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Projet::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Créer des utilisateurs de test s'ils n'existent pas
        $this->createUsers();

        // Créer des projets avec votre structure
        $this->createProjets();
    }

    private function createUsers()
    {
        $users = [
            [
                'name' => 'Sarah Martin',
                'email' => 'sarah.martin@company.com',
            ],
            [
                'name' => 'Thomas Dubois',
                'email' => 'thomas.dubois@company.com',
            ],
            [
                'name' => 'Marie Leroy',
                'email' => 'marie.leroy@company.com',
            ],
            [
                'name' => 'Pierre Lambert',
                'email' => 'pierre.lambert@company.com',
            ],
            [
                'name' => 'Julie Moreau',
                'email' => 'julie.moreau@company.com',
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'email_verified_at' => now(),
                    'password' => bcrypt('password'),
                    'created_at' => now()->subDays(rand(30, 365)),
                    'updated_at' => now(),
                ]
            );
        }
    }

    private function createProjets()
    {
        $users = User::all();

        $projets = [
            // Projets terminés
            [
                'nom' => 'Étude d\'impact environnemental - Zone industrielle Nord',
                'description' => 'Évaluation complète de l\'impact environnemental pour le développement de la nouvelle zone industrielle',
                'budget_total' => 150000.00,
                'budget_utilise' => 142000.00,
                'date_debut' => '2024-01-15',
                'date_fin' => '2024-03-31',
                'statut' => 'termine',
                'client' => 'Mairie de Tangier',
                'lieu_realisation' => 'Zone industrielle Nord, Tangier',
                'type_projet' => 'etude',
            ],
            [
                'nom' => 'Contrôle qualité infrastructure portuaire',
                'description' => 'Inspection et contrôle de conformité des nouvelles installations portuaires',
                'budget_total' => 200000.00,
                'budget_utilise' => 195000.00,
                'date_debut' => '2024-02-01',
                'date_fin' => '2024-06-30',
                'statut' => 'termine',
                'client' => 'Port de Tanger Med',
                'lieu_realisation' => 'Port Tanger Med',
                'type_projet' => 'controle',
            ],
            [
                'nom' => 'Suivi construction résidentiel Al Majd',
                'description' => 'Supervision et suivi des travaux de construction du complexe résidentiel Al Majd',
                'budget_total' => 80000.00,
                'budget_utilise' => 75000.00,
                'date_debut' => '2024-03-01',
                'date_fin' => '2024-05-15',
                'statut' => 'termine',
                'client' => 'Promoteur Al Majd',
                'lieu_realisation' => 'Quartier Boubana, Tangier',
                'type_projet' => 'suivi',
            ],

            // Projets en cours
            [
                'nom' => 'Étude géotechnique autoroute Tangier-Tétouan',
                'description' => 'Étude approfondie des sols pour l\'extension de l\'autoroute Tangier-Tétouan',
                'budget_total' => 300000.00,
                'budget_utilise' => 180000.00,
                'date_debut' => '2024-05-01',
                'date_fin' => '2024-11-30',
                'statut' => 'en_cours',
                'client' => 'Autoroutes du Maroc (ADM)',
                'lieu_realisation' => 'Axe Tangier-Tétouan',
                'type_projet' => 'etude',
            ],
            [
                'nom' => 'Contrôle technique Centre Commercial Marina',
                'description' => 'Contrôle de conformité et supervision technique du centre commercial Marina Bay',
                'budget_total' => 250000.00,
                'budget_utilise' => 120000.00,
                'date_debut' => '2024-06-15',
                'date_fin' => '2024-12-15',
                'statut' => 'en_cours',
                'client' => 'Marina Bay Development',
                'lieu_realisation' => 'Marina Bay, Tangier',
                'type_projet' => 'controle',
            ],
            [
                'nom' => 'Suivi travaux station épuration',
                'description' => 'Supervision des travaux d\'extension de la station d\'épuration des eaux usées',
                'budget_total' => 120000.00,
                'budget_utilise' => 95000.00,
                'date_debut' => '2024-04-01',
                'date_fin' => '2024-10-31',
                'statut' => 'en_cours',
                'client' => 'ONEE (Office National de l\'Électricité et de l\'Eau Potable)',
                'lieu_realisation' => 'Station épuration Sud, Tangier',
                'type_projet' => 'suivi',
            ],
            [
                'nom' => 'Étude impact acoustique aéroport',
                'description' => 'Évaluation de l\'impact acoustique des nouvelles pistes d\'atterrissage',
                'budget_total' => 90000.00,
                'budget_utilise' => 35000.00,
                'date_debut' => '2024-07-01',
                'date_fin' => '2024-09-30',
                'statut' => 'en_cours',
                'client' => 'ONDA (Office National Des Aéroports)',
                'lieu_realisation' => 'Aéroport Ibn Battouta, Tangier',
                'type_projet' => 'etude',
            ],

            // Projets en attente
            [
                'nom' => 'Contrôle complexe touristique Cabo Negro',
                'description' => 'Inspection et contrôle de conformité du complexe touristique en développement',
                'budget_total' => 180000.00,
                'budget_utilise' => 15000.00,
                'date_debut' => '2024-08-01',
                'date_fin' => '2024-12-31',
                'statut' => 'en_attente',
                'client' => 'Cabo Negro Resort',
                'lieu_realisation' => 'Cabo Negro, Tétouan',
                'type_projet' => 'controle',
            ],
            [
                'nom' => 'Étude faisabilité pont Bouregreg',
                'description' => 'Étude de faisabilité technique et environnementale pour le nouveau pont',
                'budget_total' => 220000.00,
                'budget_utilise' => 25000.00,
                'date_debut' => '2024-09-01',
                'date_fin' => '2025-02-28',
                'statut' => 'en_attente',
                'client' => 'Ministère de l\'Équipement',
                'lieu_realisation' => 'Oued Bouregreg, Rabat-Salé',
                'type_projet' => 'etude',
            ],
            [
                'nom' => 'Suivi construction université Al Akhawayn Extension',
                'description' => 'Supervision des travaux d\'extension du campus universitaire',
                'budget_total' => 160000.00,
                'budget_utilise' => 8000.00,
                'date_debut' => '2024-09-15',
                'date_fin' => '2025-06-30',
                'statut' => 'en_attente',
                'client' => 'Université Al Akhawayn',
                'lieu_realisation' => 'Ifrane',
                'type_projet' => 'suivi',
            ],

            // Projets supplémentaires pour avoir plus de données
            [
                'nom' => 'Étude hydrogéologique bassin Loukkos',
                'description' => 'Étude des ressources en eau souterraine du bassin de Loukkos',
                'budget_total' => 140000.00,
                'budget_utilise' => 70000.00,
                'date_debut' => '2024-05-15',
                'date_fin' => '2024-10-15',
                'statut' => 'en_cours',
                'client' => 'Agence du Bassin Hydraulique de Loukkos',
                'lieu_realisation' => 'Bassin Loukkos, région Tanger-Tétouan',
                'type_projet' => 'etude',
            ],
            [
                'nom' => 'Contrôle barrage Kalaya',
                'description' => 'Inspection et contrôle de sécurité du barrage Kalaya',
                'budget_total' => 95000.00,
                'budget_utilise' => 45000.00,
                'date_debut' => '2024-06-01',
                'date_fin' => '2024-08-31',
                'statut' => 'en_cours',
                'client' => 'Direction des Barrages et Canalisations',
                'lieu_realisation' => 'Barrage Kalaya, Tétouan',
                'type_projet' => 'controle',
            ],
            [
                'nom' => 'Suivi réhabilitation médina Tétouan',
                'description' => 'Supervision des travaux de réhabilitation de la médina historique',
                'budget_total' => 110000.00,
                'budget_utilise' => 85000.00,
                'date_debut' => '2024-03-15',
                'date_fin' => '2024-09-15',
                'statut' => 'en_cours',
                'client' => 'Conseil Régional Tanger-Tétouan-Al Hoceima',
                'lieu_realisation' => 'Médina de Tétouan',
                'type_projet' => 'suivi',
            ],

            // Projets terminés récents
            [
                'nom' => 'Étude sismique région Rif',
                'description' => 'Évaluation du risque sismique dans la région du Rif',
                'budget_total' => 185000.00,
                'budget_utilise' => 180000.00,
                'date_debut' => '2024-01-01',
                'date_fin' => '2024-04-30',
                'statut' => 'termine',
                'client' => 'Institut National de Géophysique',
                'lieu_realisation' => 'Région du Rif',
                'type_projet' => 'etude',
            ],
            [
                'nom' => 'Contrôle usine dessalement Nador',
                'description' => 'Contrôle de conformité de l\'usine de dessalement d\'eau de mer',
                'budget_total' => 170000.00,
                'budget_utilise' => 165000.00,
                'date_debut' => '2024-02-15',
                'date_fin' => '2024-07-15',
                'statut' => 'termine',
                'client' => 'ONEE - Branche Eau',
                'lieu_realisation' => 'Nador',
                'type_projet' => 'controle',
            ],
        ];

        foreach ($projets as $index => $projetData) {
            $responsable = $users->random();

            Projet::create([
                'nom' => $projetData['nom'],
                'description' => $projetData['description'],
                'budget_total' => $projetData['budget_total'],
                'budget_utilise' => $projetData['budget_utilise'],
                'date_debut' => $projetData['date_debut'] ? Carbon::parse($projetData['date_debut']) : null,
                'date_fin' => $projetData['date_fin'] ? Carbon::parse($projetData['date_fin']) : null,
                'statut' => $projetData['statut'],
                'client' => $projetData['client'],
                'lieu_realisation' => $projetData['lieu_realisation'],
                'responsable_id' => $responsable->id,
                'type_projet' => $projetData['type_projet'],
                'created_at' => Carbon::parse($projetData['date_debut'] ?? now()->subDays(rand(1, 180))),
                'updated_at' => now()->subDays(rand(1, 30)),
            ]);
        }
    }
}
