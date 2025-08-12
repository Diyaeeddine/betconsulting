<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class InnovationTransitionController extends Controller
{
    // CHANGÉ : dashboard() -> index() pour être cohérent avec les autres contrôleurs
    public function index()
    {
        // Données pour le dashboard
        $metriques = [
            'totalTickets' => 1247,
            'ticketsOuverts' => 89,
            'ticketsEnAttente' => 34,
            'ticketsResolus' => 1124,
            'tempsResolutionMoyen' => 4.2,
            'tauxSatisfaction' => 94.5,
            'problemesCritiques' => 12,
        ];

        $tendanceTickets = [
            ['date' => '01/08', 'nouveaux' => 45, 'resolus' => 38, 'enAttente' => 12],
            ['date' => '02/08', 'nouveaux' => 52, 'resolus' => 41, 'enAttente' => 15],
            ['date' => '03/08', 'nouveaux' => 38, 'resolus' => 47, 'enAttente' => 8],
            ['date' => '04/08', 'nouveaux' => 61, 'resolus' => 35, 'enAttente' => 18],
            ['date' => '05/08', 'nouveaux' => 43, 'resolus' => 52, 'enAttente' => 11],
            ['date' => '06/08', 'nouveaux' => 55, 'resolus' => 48, 'enAttente' => 14],
            ['date' => '07/08', 'nouveaux' => 49, 'resolus' => 44, 'enAttente' => 16],
        ];

        $satisfactionData = [
            ['periode' => 'Sem 1', 'satisfaction' => 92, 'objectif' => 90],
            ['periode' => 'Sem 2', 'satisfaction' => 94, 'objectif' => 90],
            ['periode' => 'Sem 3', 'satisfaction' => 89, 'objectif' => 90],
            ['periode' => 'Sem 4', 'satisfaction' => 96, 'objectif' => 90],
        ];

        $performanceAgents = [
            ['agent' => 'Ahmed B.', 'ticketsTraites' => 156, 'tempsResolution' => 3.8, 'satisfaction' => 96],
            ['agent' => 'Fatima K.', 'ticketsTraites' => 142, 'tempsResolution' => 4.1, 'satisfaction' => 94],
            ['agent' => 'Youssef M.', 'ticketsTraites' => 138, 'tempsResolution' => 4.5, 'satisfaction' => 92],
            ['agent' => 'Aicha L.', 'ticketsTraites' => 134, 'tempsResolution' => 3.9, 'satisfaction' => 95],
        ];

        $problemesFrequents = [
            ['categorie' => 'Problèmes réseau', 'nombre' => 245, 'pourcentage' => 35],
            ['categorie' => 'Logiciels', 'nombre' => 189, 'pourcentage' => 27],
            ['categorie' => 'Matériel', 'nombre' => 134, 'pourcentage' => 19],
            ['categorie' => 'Accès/Permissions', 'nombre' => 98, 'pourcentage' => 14],
            ['categorie' => 'Autres', 'nombre' => 35, 'pourcentage' => 5],
        ];

        $alerts = [
            [
                'id' => '1',
                'type' => 'error',
                'title' => 'Problème critique détecté',
                'message' => 'Serveur de base de données principal en surcharge - Intervention immédiate requise',
                'timestamp' => 'Il y a 5 minutes'
            ],
            [
                'id' => '2',
                'type' => 'warning',
                'title' => 'Maintenance programmée',
                'message' => 'Mise à jour système prévue demain de 14h à 16h - Services temporairement indisponibles',
                'timestamp' => 'Il y a 2 heures'
            ],
            [
                'id' => '3',
                'type' => 'success',
                'title' => 'Objectif de satisfaction atteint',
                'message' => 'Le taux de satisfaction client a dépassé l\'objectif de 90% ce mois-ci (94.5%)',
                'timestamp' => 'Il y a 1 jour'
            ]
        ];

        return Inertia::render('innovation-transition/Dashboard', [
            'metriques' => $metriques,
            'tendanceTickets' => $tendanceTickets,
            'satisfactionData' => $satisfactionData,
            'performanceAgents' => $performanceAgents,
            'problemesFrequents' => $problemesFrequents,
            'alerts' => $alerts,
        ]);
    }
}
