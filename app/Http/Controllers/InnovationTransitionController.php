<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Projet;
use App\Models\User;
use App\Models\TicketSupport;
use Illuminate\Support\Facades\Log;

class InnovationTransitionController extends Controller
{
    public function index()
    {
        return $this->dashboard();
    }

    public function dashboard()
    {
        try {
            $totalProjets = Projet::count();
            Log::info("Dashboard - Total projets: " . $totalProjets);

            if ($totalProjets === 0) {
                Log::warning("Aucun projet trouvé dans la base de données");
                return Inertia::render('innovation-transition/InnovationDashboard', [
                    'stats' => $this->getEmptyStats(),
                    'projets_recents' => [],
                    'activites_recentes' => [],
                ]);
            }

            $stats = $this->calculateDashboardStats();
            $projets_recents = $this->getRecentProjects();
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

    public function tickets()
    {
        try {
            $tickets = TicketSupport::with(['demandeur', 'assignee'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($ticket) {
                    return [
                        'id' => $ticket->id,
                        'titre' => $ticket->titre,
                        'description' => $ticket->description,
                        'statut' => $ticket->statut,
                        'priorite' => $ticket->priorite,
                        'type' => $ticket->type,
                        'client' => $ticket->demandeur ? $ticket->demandeur->name : 'Inconnu',
                        'assignee' => $ticket->assignee ? $ticket->assignee->name : null,
                        'created_at' => $ticket->created_at->toISOString(),
                        'updated_at' => $ticket->updated_at->toISOString(),
                    ];
                });

            Log::info("Tickets trouvés: " . $tickets->count());

            return Inertia::render('innovation-transition/InnovationTickets', [
                'tickets' => $tickets
            ]);

        } catch (\Exception $e) {
            Log::error("Erreur dans tickets: " . $e->getMessage());

            return Inertia::render('innovation-transition/InnovationTickets', [
                'tickets' => [],
                'error' => 'Erreur lors du chargement des tickets'
            ]);
        }
    }

    public function storeTicket(Request $request)
    {
        try {
            $validated = $request->validate([
                'titre' => 'required|string|max:255',
                'description' => 'required|string|max:2000',
                'priorite' => 'required|in:basse,moyenne,haute,critique',
                'type' => 'required|in:bug,amelioration,question,incident,demande',
                'client' => 'nullable|string|max:255',
                'assignee' => 'nullable|string|max:255',
            ]);

            Log::info('Création ticket - données reçues:', $validated);

            $assigneeId = null;
            if (!empty($validated['assignee'])) {
                $assigneeUser = User::where('name', 'like', '%' . $validated['assignee'] . '%')->first();
                if ($assigneeUser) {
                    $assigneeId = $assigneeUser->id;
                }
            }

            $ticket = TicketSupport::create([
                'titre' => $validated['titre'],
                'description' => $validated['description'],
                'priorite' => $validated['priorite'],
                'type' => $validated['type'],
                'statut' => 'ouvert',
                'severite' => 'mineure',
                'demandeur_id' => auth()->id(),
                'assignee_id' => $assigneeId,
                'innovation_id' => null,
                'environnement' => 'prod',
            ]);

            Log::info('Ticket créé avec succès - ID: ' . $ticket->id);

            return redirect()->route('innovation.tickets')
                ->with('success', 'Ticket #' . $ticket->id . ' créé avec succès !');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur validation:', $e->errors());
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();

        } catch (\Exception $e) {
            Log::error('Erreur création ticket: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Erreur lors de la création du ticket: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function updateTicket(Request $request, $id)
    {
        try {
            $ticket = TicketSupport::findOrFail($id);

            $validated = $request->validate([
                'titre' => 'required|string|max:255',
                'description' => 'required|string|max:2000',
                'priorite' => 'required|in:basse,moyenne,haute,critique',
                'type' => 'required|in:bug,amelioration,question,incident,demande',
                'statut' => 'required|in:ouvert,en_cours,en_attente,resolu,ferme',
                'client' => 'nullable|string|max:255',
                'assignee' => 'nullable|string|max:255',
            ]);

            Log::info('Modification ticket #' . $id . ' - données reçues:', $validated);

            $assigneeId = null;
            if (!empty($validated['assignee'])) {
                $assigneeUser = User::where('name', 'like', '%' . $validated['assignee'] . '%')->first();
                if ($assigneeUser) {
                    $assigneeId = $assigneeUser->id;
                }
            }

            $updateData = [
                'titre' => $validated['titre'],
                'description' => $validated['description'],
                'priorite' => $validated['priorite'],
                'type' => $validated['type'],
                'statut' => $validated['statut'],
                'assignee_id' => $assigneeId,
            ];

            if ($validated['statut'] === 'resolu' && $ticket->statut !== 'resolu') {
                $updateData['date_resolution'] = now();
                $updateData['temps_resolution_heures'] = $ticket->created_at->diffInHours(now());
            }

            $ticket->update($updateData);

            Log::info('Ticket #' . $id . ' modifié avec succès');

            return redirect()->route('innovation.tickets')
                ->with('success', 'Ticket #' . $ticket->id . ' modifié avec succès !');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Ticket non trouvé: ' . $id);
            return redirect()->back()
                ->with('error', 'Ticket non trouvé.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur validation modification:', $e->errors());
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();

        } catch (\Exception $e) {
            Log::error('Erreur modification ticket: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Erreur lors de la modification du ticket: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroyTicket($id)
    {
        try {
            $ticket = TicketSupport::findOrFail($id);
            $ticketTitre = $ticket->titre;

            $ticket->delete();

            Log::info('Ticket #' . $id . ' supprimé avec succès');

            return redirect()->route('innovation.tickets')
                ->with('success', 'Ticket "' . $ticketTitre . '" supprimé avec succès !');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Ticket non trouvé pour suppression: ' . $id);
            return redirect()->back()
                ->with('error', 'Ticket non trouvé.');

        } catch (\Exception $e) {
            Log::error('Erreur suppression ticket: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Erreur lors de la suppression du ticket: ' . $e->getMessage());
        }
    }

    private function calculateDashboardStats()
    {
        $total_projets = Projet::count();
        $projets_en_cours = Projet::where('statut', 'en_cours')->count();
        $projets_termines = Projet::where('statut', 'termine')->count();
        $projets_en_attente = Projet::where('statut', 'en_attente')->count();

        $projets_en_retard = Projet::where('statut', 'en_cours')
            ->where('date_fin', '<', now())
            ->count();

        $projets_par_statut = [
            'en_cours' => $projets_en_cours,
            'termine' => $projets_termines,
            'en_attente' => $projets_en_attente,
        ];

        $projets_par_priorite = [
            'etude' => Projet::where('type_projet', 'etude')->count(),
            'suivi' => Projet::where('type_projet', 'suivi')->count(),
            'controle' => Projet::where('type_projet', 'controle')->count(),
        ];

        $budget_total_alloue = (float) Projet::sum('budget_total');
        $budget_total_utilise = (float) Projet::sum('budget_utilise');
        $taux_completion = $total_projets > 0 ? round(($projets_termines / $total_projets) * 100) : 0;
        $projets_livres_trimestre = Projet::where('statut', 'termine')
            ->whereBetween('date_fin', [now()->startOfQuarter(), now()->endOfQuarter()])
            ->count();

        $tickets_ouverts = TicketSupport::whereIn('statut', ['ouvert', 'en_cours'])->count();
        $tickets_resolus_semaine = TicketSupport::where('statut', 'resolu')
            ->whereBetween('date_resolution', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        return [
            'total_projets' => $total_projets,
            'projets_actifs' => $projets_en_cours,
            'projets_en_retard' => $projets_en_retard,
            'projets_par_statut' => $projets_par_statut,
            'projets_par_priorite' => $projets_par_priorite,
            'budget_total_alloue' => $budget_total_alloue,
            'budget_total_utilise' => $budget_total_utilise,
            'membres_actifs' => User::count(),
            'projets_livres_trimestre' => $projets_livres_trimestre,
            'taux_completion' => $taux_completion,
            'taches_en_retard' => rand(2, 8),
            'taches_completees_mois' => rand(15, 30),
            'taches_assignees' => rand(10, 25),
            'tickets_ouverts' => $tickets_ouverts,
            'tickets_resolus_semaine' => $tickets_resolus_semaine,
            'temps_moyen_resolution' => TicketSupport::whereNotNull('temps_resolution_heures')->avg('temps_resolution_heures') ?? 0,
            'satisfaction_client' => rand(85, 95),
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
                $progression = 0;
                if ($projet->budget_total > 0) {
                    $progression = round(($projet->budget_utilise / $projet->budget_total) * 100);
                }

                if ($projet->statut === 'termine') {
                    $progression = 100;
                } elseif ($projet->statut === 'en_attente') {
                    $progression = min($progression, 20);
                }

                return [
                    'id' => $projet->id,
                    'nom' => $projet->nom,
                    'statut' => $projet->statut,
                    'priorite' => $projet->type_projet,
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
