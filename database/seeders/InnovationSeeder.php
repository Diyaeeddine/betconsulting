<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Innovation;
use App\Models\TacheInnovation;
use App\Models\TicketSupport;
use App\Models\User;

class InnovationSeeder extends Seeder
{
    public function run()
    {
        $user = User::first();

        if (!$user) {
            $user = User::create([
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Créer des projets d'innovation
        $innovations = [
            [
                'titre' => 'Plateforme IA pour l\'analyse prédictive',
                'description' => 'Développement d\'une plateforme utilisant l\'intelligence artificielle.',
                'statut' => 'en_cours',
                'priorite' => 'haute',
                'budget_alloue' => 50000,
                'budget_utilise' => 15000,
                'responsable_id' => $user->id,
                'createur_id' => $user->id,
                'progression' => 35,
            ],
            [
                'titre' => 'Application mobile éco-responsable',
                'description' => 'Création d\'une application mobile pour l\'écologie.',
                'statut' => 'en_cours',
                'priorite' => 'moyenne',
                'budget_alloue' => 30000,
                'budget_utilise' => 8000,
                'responsable_id' => $user->id,
                'createur_id' => $user->id,
                'progression' => 60,
            ],
            [
                'titre' => 'Système de gestion automatisée',
                'description' => 'Automatisation des processus de gestion.',
                'statut' => 'termine',
                'priorite' => 'critique',
                'budget_alloue' => 75000,
                'budget_utilise' => 72000,
                'responsable_id' => $user->id,
                'createur_id' => $user->id,
                'progression' => 100,
            ]
        ];

        foreach ($innovations as $innovationData) {
            Innovation::create($innovationData);
        }
    }
}
