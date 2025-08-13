<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Projet; // ✅ Utiliser le bon modèle
use App\Models\User;
use Illuminate\Support\Facades\Log;

class InnovationTransitionController extends Controller
{
    public function index()
    {
        // Rediriger vers dashboard pour éviter la duplication
        return $this->dashboard();
    }

    public function dashboard()
    {
        try {
            // Vérifier si nous avons des projets
            $totalProjets = Projet::count();
            Log::info("Dashboard - Total projets: " . $totalProjets);

            if ($totalProjets === 0) {
                Log::warning("Aucun projet trouvé dans la base de données");

                // Retourner des données vides mais structurées
                return Inertia::render('innovation-transition/InnovationDashboard', [
                    'stats' => $this->getEmptyStats(),
                    'projets_recents' => [],
                    'activites_recentes' => [],
                ]);
            }

            // Calculer les statistiques réelles
            $stats = $this->calculateDashboardStats();

            // Récupérer les projets récents
            $projets_recents = $this->getRecentProjects();

            // Activités factices
            $activites_recentes = $this->getFakeActivities();

            return Inertia::render('innovation-transition/InnovationDashboard', [
                'stats' => $stats,
                'projets_recents' => $projets_recents,
                'activites_recentes' => $activites_recentes,
            ]);

        } catch (\Exception $e) {
            Log::error("Erreur dans le dashboard: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());

            return Inertia::render('innovation-transition/InnovationDashboard', [
                'stats' => $this->getEmptyStats(),
                'projets_recents' => [],
                'activites_recentes' => [],
                'error' => 'Erreur lors du chargement des données: ' . $e->getMessage()
            ]);
        }
    }

    private function calculateDashboardStats()
    {
        // Compter les projets par statut
        $total_projets = Projet::count();
        $projets_en_cours = Projet::where('statut', 'en_cours')->count();
        $projets_termines = Projet::where('statut', 'termine')->count();
        $projets_en_attente = Projet::where('statut', 'en_attente')->count();

        // Projets en retard (date_fin passée et toujours en cours)
        $projets_en_retard = Projet::where('statut', 'en_cours')
            ->where('date_fin', '<', now())
            ->count();

        // Répartition par statut
        $projets_par_statut = [
            'en_cours' => $projets_en_cours,
            'termine' => $projets_termines,
            'en_attente' => $projets_en_attente,
        ];

        // Répartition par type (utilisé comme priorité dans le dashboard)
        $projets_par_priorite = [
            'etude' => Projet::where('type_projet', 'etude')->count(),
            'suivi' => Projet::where('type_projet', 'suivi')->count(),
            'controle' => Projet::where('type_projet', 'controle')->count(),
        ];

        // Calculs budgétaires
        $budget_total_alloue = (float) Projet::sum('budget_total');
        $budget_total_utilise = (float) Projet::sum('budget_utilise');

        // Autres métriques
        $taux_completion = $total_projets > 0 ? round(($projets_termines / $total_projets) * 100) : 0;

        $projets_livres_trimestre = Projet::where('statut', 'termine')
            ->whereBetween('date_fin', [now()->startOfQuarter(), now()->endOfQuarter()])
            ->count();

        return [
            // Projets
            'total_projets' => $total_projets,
            'projets_actifs' => $projets_en_cours,
            'projets_en_retard' => $projets_en_retard,
            'projets_par_statut' => $projets_par_statut,
            'projets_par_priorite' => $projets_par_priorite,

            // Budget
            'budget_total_alloue' => $budget_total_alloue,
            'budget_total_utilise' => $budget_total_utilise,

            // Équipe
            'membres_actifs' => User::count(),
            'projets_livres_trimestre' => $projets_livres_trimestre,
            'taux_completion' => $taux_completion,

            // Données simulées pour tâches et tickets (à remplacer plus tard)
            'taches_en_retard' => rand(2, 8),
            'taches_completees_mois' => rand(15, 30),
            'taches_assignees' => rand(10, 25),
            'tickets_ouverts' => rand(3, 12),
            'tickets_resolus_semaine' => rand(5, 15),
            'temps_moyen_resolution' => round(rand(2, 48) + (rand(0, 9) / 10), 1),
            'satisfaction_client' => rand(82, 98),

            // Tendances (variation par rapport au mois/semaine précédent)
            'tendance_projets' => rand(-20, 30),
            'tendance_tickets' => rand(-25, 20),
            'tendance_satisfaction' => rand(-8, 12),
        ];
    }

    private function getRecentProjects()
    {
        return Projet::with('responsable')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($projet) {
                // Calculer la progression basée sur le budget utilisé
                $progression = 0;
                if ($projet->budget_total > 0) {
                    $progression = round(($projet->budget_utilise / $projet->budget_total) * 100);
                }

                // Ajuster selon le statut
                if ($projet->statut === 'termine') {
                    $progression = 100;
                } elseif ($projet->statut === 'en_attente') {
                    $progression = min($progression, 20); // Max 20% pour projets en attente
                }

                return [
                    'id' => $projet->id,
                    'nom' => $projet->nom,
                    'statut' => $projet->statut,
                    'priorite' => $projet->type_projet, // Utiliser type_projet comme priorité
                    'date_creation' => $projet->created_at->format('d/m/Y'),
                    'responsable' => $projet->responsable ? $projet->responsable->name : 'Non assigné',
                    'progression' => $progression,
                ];
            })
            ->toArray();
    }

    private function getFakeActivities()
    {
        return [
            [
                'id' => 1,
                'type' => 'projet_cree',
                'description' => 'Nouveau projet d\'étude géotechnique créé',
                'utilisateur' => 'Sarah Martin',
                'date' => now()->subHours(2)->format('d/m/Y H:i'),
                'projet' => 'Autoroute Tangier-Tétouan',
            ],
            [
                'id' => 2,
                'type' => 'budget_modifie',
                'description' => 'Budget du projet mis à jour',
                'utilisateur' => 'Thomas Dubois',
                'date' => now()->subHours(5)->format('d/m/Y H:i'),
                'projet' => 'Centre Commercial Marina',
            ],
            [
                'id' => 3,
                'type' => 'statut_change',
                'description' => 'Projet marqué comme terminé',
                'utilisateur' => 'Marie Leroy',
                'date' => now()->subDay()->format('d/m/Y H:i'),
                'projet' => 'Infrastructure portuaire',
            ],
            [
                'id' => 4,
                'type' => 'document_ajoute',
                'description' => 'Documentation technique ajoutée',
                'utilisateur' => 'Pierre Lambert',
                'date' => now()->subDays(2)->format('d/m/Y H:i'),
                'projet' => 'Station épuration',
            ],
            [
                'id' => 5,
                'type' => 'reunion_planifiee',
                'description' => 'Réunion de suivi planifiée',
                'utilisateur' => 'Julie Moreau',
                'date' => now()->subDays(3)->format('d/m/Y H:i'),
                'projet' => 'Barrage Kalaya',
            ],
        ];
    }

    private function getEmptyStats()
    {
        return [
            'total_projets' => 0,
            'projets_actifs' => 0,
            'projets_en_retard' => 0,
            'projets_par_statut' => [
                'en_cours' => 0,
                'termine' => 0,
                'en_attente' => 0,
            ],
            'projets_par_priorite' => [
                'etude' => 0,
                'suivi' => 0,
                'controle' => 0,
            ],
            'budget_total_alloue' => 0,
            'budget_total_utilise' => 0,
            'taches_en_retard' => 0,
            'taches_completees_mois' => 0,
            'taches_assignees' => 0,
            'tickets_ouverts' => 0,
            'tickets_resolus_semaine' => 0,
            'temps_moyen_resolution' => 0,
            'satisfaction_client' => 0,
            'membres_actifs' => 0,
            'projets_livres_trimestre' => 0,
            'taux_completion' => 0,
            'tendance_projets' => 0,
            'tendance_tickets' => 0,
            'tendance_satisfaction' => 0,
        ];
    }
}

// Vérifiez aussi vos routes dans routes/web.php :

/*
Route::prefix('innovation-transition')->name('innovation.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\InnovationTransitionController::class, 'dashboard'])->name('dashboard');
    Route::get('/', [App\Http\Controllers\InnovationTransitionController::class, 'index'])->name('index');

    // Autres routes...
    Route::get('/projets', function() { return 'Liste des projets'; })->name('projets.index');
    Route::get('/projets/create', function() { return 'Créer un projet'; })->name('projets.create');
    Route::get('/taches', function() { return 'Liste des tâches'; })->name('taches.index');
    Route::get('/tickets', function() { return 'Liste des tickets'; })->name('tickets.index');
    Route::get('/documents', function() { return 'Documents'; })->name('documents.index');
    Route::get('/budget', function() { return 'Budget'; })->name('budget.index');
    Route::get('/analytics', function() { return 'Analytics'; })->name('analytics.index');
});
*/
