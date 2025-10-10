<?php

namespace App\Http\Controllers;

use App\Models\MarchePublic;
use App\Models\DossierMarche;
use App\Models\ParticipationMarche;
use App\Models\DocumentDossier;
use App\Models\AffectationTache;
use App\Models\HistoriqueMarche;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TracabiliteController extends Controller
{
    /**
     * Page principale de traçabilité
     */
    public function tracabilite()
    {
        $marches = MarchePublic::where('is_accepted', true)
            ->with([
                'dossiers' => function($q) {
                    $q->withCount([
                        'fichiers',
                        'taches',
                        'taches as taches_terminees_count' => function($query) {
                            $query->whereIn('statut', ['terminee', 'validee']);
                        }
                    ]);
                },
                'participants.salarie',
                'historiques' => function($q) {
                    $q->with('user')->latest('date_evenement')->limit(20);
                }
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($marche) {
                $totalTaches = $marche->dossiers->sum('taches_count');
                $tachesTerminees = $marche->dossiers->sum('taches_terminees_count');
                $totalFichiers = $marche->dossiers->sum('fichiers_count');
                
                $documentsPermanents = $marche->fichiers()
                    ->whereNotNull('document_id')
                    ->count();

                return [
                    'id' => $marche->id,
                    'reference' => $marche->reference,
                    'objet' => $marche->objet,
                    'maitre_ouvrage' => $marche->maitre_ouvrage,
                    'etat' => $marche->etat ?? 'en cours',
                    'etape' => $marche->etape ?? 'preparation',
                    'importance' => $marche->importance,
                    'date_limite' => $marche->date_limite_soumission?->format('Y-m-d') 
                                   ?? $marche->date_ouverture?->format('Y-m-d'),
                    'created_at' => $marche->created_at->format('Y-m-d'),
                    
                    'dossiers' => $marche->dossiers->map(function($dossier) {
                        $avancement = $dossier->taches_count > 0 
                            ? round(($dossier->taches_terminees_count / $dossier->taches_count) * 100) 
                            : 0;

                        return [
                            'id' => $dossier->id,
                            'type' => $dossier->type_dossier,
                            'nom' => $dossier->nom_dossier,
                            'statut' => $dossier->statut,
                            'avancement' => $avancement,
                            'nb_fichiers' => $dossier->fichiers_count,
                            'nb_taches' => $dossier->taches_count,
                            'taches_terminees' => $dossier->taches_terminees_count,
                        ];
                    }),
                    
                    'participants' => $marche->participants->map(function($participant) {
                        return [
                            'id' => $participant->id,
                            'nom' => $participant->salarie->nom_complet ?? 'Participant',
                            'role' => $participant->role_global,
                            'taches_affectees' => $participant->nb_taches_affectees,
                            'taches_terminees' => $participant->nb_taches_terminees,
                            'temps_passe' => (float) $participant->temps_total_passe,
                            'taux_completion' => $participant->taux_completion,
                        ];
                    }),
                    
                    'historique' => $marche->historiques->map(function($event) {
                        return [
                            'type' => $event->type_evenement,
                            'description' => $event->description,
                            'user' => $event->user?->name ?? $event->role_utilisateur ?? 'Système',
                            'date' => $event->date_evenement->format('Y-m-d H:i:s'),
                            'commentaire' => $event->commentaire,
                        ];
                    }),
                    
                    'stats' => [
                        'total_fichiers' => $totalFichiers,
                        'total_participants' => $marche->participants->count(),
                        'total_taches' => $totalTaches,
                        'taches_terminees' => $tachesTerminees,
                        'documents_permanents' => $documentsPermanents,
                    ],
                ];
            });

        return Inertia::render('marches-marketing/Tracabilite', [
            'marches' => $marches
        ]);
    }

    /**
     * Récupérer les fichiers d'un dossier
     */
    public function getDossierFichiers($dossierId)
    {
        $dossier = DossierMarche::with(['fichiers.uploader', 'fichiers.tache'])
            ->findOrFail($dossierId);

        $fichiers = $dossier->fichiers->map(function($fichier) {
            return [
                'id' => $fichier->id,
                'nom_original' => $fichier->nom_original,
                'nom_fichier' => $fichier->nom_fichier,
                'type_mime' => $fichier->type_mime,
                'taille_fichier' => $fichier->taille_fichier,
                'date_upload' => $fichier->date_upload,
                'uploaded_by' => $fichier->uploader?->name ?? 'Inconnu',
                'tache_associee' => $fichier->tache?->nom_tache ?? 'N/A',
                'type_attachment' => $fichier->type_attachment,
                'chemin_fichier' => $fichier->chemin_fichier,
            ];
        });

        return response()->json([
            'fichiers' => $fichiers,
            'dossier' => [
                'id' => $dossier->id,
                'nom' => $dossier->nom_dossier,
                'type' => $dossier->type_dossier,
            ]
        ]);
    }

    /**
     * Récupérer les tâches d'un dossier avec leurs affectations
     */
    public function getDossierTaches($dossierId)
    {
        $dossier = DossierMarche::with([
            'taches.affectations.salarie',
            'taches.fichiers'
        ])->findOrFail($dossierId);

        $taches = $dossier->taches->map(function($tache) {
            $affectations = $tache->affectations->map(function($affectation) {
                // Calculer le temps passé
                $tempsPasse = null;
                if ($affectation->date_affectation && $affectation->date_terminee) {
                    $debut = \Carbon\Carbon::parse($affectation->date_affectation);
                    $fin = \Carbon\Carbon::parse($affectation->date_terminee);
                    $tempsPasse = round($fin->diffInHours($debut), 2);
                }

                return [
                    'salarie_nom' => $affectation->salarie->nom_complet ?? 'Inconnu',
                    'role' => $affectation->role_affectation,
                    'date_affectation' => $affectation->date_affectation?->format('Y-m-d H:i'),
                    'date_terminee' => $affectation->date_terminee?->format('Y-m-d H:i'),
                    'temps_passe' => $tempsPasse,
                    'statut' => $affectation->statut_affectation,
                ];
            });

            return [
                'id' => $tache->id,
                'nom_tache' => $tache->nom_tache,
                'description' => $tache->description,
                'statut' => $tache->statut,
                'priorite' => $tache->priorite,
                'date_debut' => $tache->date_debut?->format('Y-m-d'),
                'date_limite' => $tache->date_limite?->format('Y-m-d'),
                'date_fin' => $tache->date_fin?->format('Y-m-d'),
                'duree_estimee' => (float) $tache->duree_estimee,
                'duree_reelle' => (float) $tache->duree_reelle,
                'nb_fichiers' => $tache->fichiers->count(),
                'affectations' => $affectations,
                'est_en_retard' => $tache->est_en_retard,
            ];
        });

        return response()->json([
            'taches' => $taches,
            'dossier' => [
                'id' => $dossier->id,
                'nom' => $dossier->nom_dossier,
                'type' => $dossier->type_dossier,
            ]
        ]);
    }

    /**
     * Récupérer la timeline chronologique d'un dossier
     */
    public function getDossierTimeline($dossierId)
    {
        $dossier = DossierMarche::with(['taches'])->findOrFail($dossierId);

        $timeline = [];

        // Récupérer toutes les affectations avec leurs tâches
        $affectations = AffectationTache::whereHas('tache', function($query) use ($dossierId) {
            $query->where('dossier_marche_id', $dossierId);
        })
        ->with(['tache', 'salarie'])
        ->orderBy('date_affectation')
        ->get();

        foreach ($affectations as $affectation) {
            // Événement d'affectation
            $timeline[] = [
                'type' => 'affectation',
                'tache_nom' => $affectation->tache->nom_tache,
                'description' => "Tâche affectée à " . $affectation->salarie->nom_complet,
                'priorite' => $affectation->tache->priorite,
                'salarie' => $affectation->salarie->nom_complet,
                'date' => $affectation->date_affectation,
                'temps_passe' => null,
            ];

            // Événement de terminaison si applicable
            if ($affectation->date_terminee) {
                $debut = \Carbon\Carbon::parse($affectation->date_affectation);
                $fin = \Carbon\Carbon::parse($affectation->date_terminee);
                $tempsPasse = round($fin->diffInHours($debut), 2);

                $timeline[] = [
                    'type' => 'terminaison',
                    'tache_nom' => $affectation->tache->nom_tache,
                    'description' => "Tâche terminée par " . $affectation->salarie->nom_complet,
                    'priorite' => $affectation->tache->priorite,
                    'salarie' => $affectation->salarie->nom_complet,
                    'date' => $affectation->date_terminee,
                    'temps_passe' => $tempsPasse,
                ];
            }
        }

        // Trier par date
        usort($timeline, function($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });

        return response()->json([
            'timeline' => $timeline,
            'dossier' => [
                'id' => $dossier->id,
                'nom' => $dossier->nom_dossier,
                'type' => $dossier->type_dossier,
            ]
        ]);
    }

    /**
     * Récupérer les tâches affectées à un participant
     */
    public function getParticipantTaches($participantId)
    {
        $participation = ParticipationMarche::with(['salarie', 'marche'])
            ->findOrFail($participantId);

        $affectations = AffectationTache::where('salarie_id', $participation->salarie_id)
            ->whereHas('tache.dossier', function($query) use ($participation) {
                $query->where('marche_id', $participation->marche_id);
            })
            ->with(['tache.dossier'])
            ->get();

        $taches = $affectations->map(function($affectation) {
            $tache = $affectation->tache;
            $dossier = $tache->dossier;

            // Calculer temps passé
            $tempsPasse = null;
            if ($affectation->date_affectation && $affectation->date_terminee) {
                $debut = \Carbon\Carbon::parse($affectation->date_affectation);
                $fin = \Carbon\Carbon::parse($affectation->date_terminee);
                $tempsPasse = round($fin->diffInHours($debut), 2);
            }

            // Calculer avancement de la tâche
            $avancement = in_array($tache->statut, ['terminee', 'validee']) ? 100 : 0;

            return [
                'tache_nom' => $tache->nom_tache,
                'statut' => $tache->statut,
                'priorite' => $tache->priorite,
                'dossier_nom' => $dossier->nom_dossier,
                'dossier_type' => $dossier->type_dossier,
                'date_affectation' => $affectation->date_affectation?->format('Y-m-d'),
                'date_terminee' => $affectation->date_terminee?->format('Y-m-d'),
                'temps_passe' => $tempsPasse,
                'avancement' => $avancement,
            ];
        });

        return response()->json([
            'participant' => [
                'id' => $participation->id,
                'nom' => $participation->salarie->nom_complet,
                'role' => $participation->role_global,
            ],
            'marche' => [
                'reference' => $participation->marche->reference,
                'objet' => $participation->marche->objet,
            ],
            'taches' => $taches,
        ]);
    }

    /**
     * Récupérer le temps passé détaillé d'un participant
     */
    public function getParticipantTemps($participantId)
    {
        $participation = ParticipationMarche::with(['salarie', 'marche'])
            ->findOrFail($participantId);

        $affectations = AffectationTache::where('salarie_id', $participation->salarie_id)
            ->whereHas('tache.dossier', function($query) use ($participation) {
                $query->where('marche_id', $participation->marche_id);
            })
            ->whereNotNull('date_terminee')
            ->with(['tache.dossier'])
            ->get();

        $details = $affectations->map(function($affectation) {
            $debut = \Carbon\Carbon::parse($affectation->date_affectation);
            $fin = \Carbon\Carbon::parse($affectation->date_terminee);
            $tempsPasseHeures = round($fin->diffInHours($debut), 2);
            $tempsPasseJours = round($fin->diffInDays($debut, false), 1);

            return [
                'tache_nom' => $affectation->tache->nom_tache,
                'dossier_nom' => $affectation->tache->dossier->nom_dossier,
                'dossier_type' => $affectation->tache->dossier->type_dossier,
                'date_debut' => $affectation->date_affectation->format('Y-m-d H:i'),
                'date_fin' => $affectation->date_terminee->format('Y-m-d H:i'),
                'temps_passe_heures' => $tempsPasseHeures,
                'temps_passe_jours' => $tempsPasseJours,
            ];
        });

        $tempsTotal = $details->sum('temps_passe_heures');
        $nbTachesTerminees = $details->count();

        return response()->json([
            'participant' => [
                'id' => $participation->id,
                'nom' => $participation->salarie->nom_complet,
                'role' => $participation->role_global,
            ],
            'marche' => [
                'reference' => $participation->marche->reference,
            ],
            'temps_total' => round($tempsTotal, 2),
            'nb_taches_terminees' => $nbTachesTerminees,
            'details' => $details,
        ]);
    }

    /**
     * Récupérer l'historique complet d'un marché
     */
    public function getMarcheHistorique($marcheId)
    {
        $marche = MarchePublic::findOrFail($marcheId);

        $historique = HistoriqueMarche::where('marche_id', $marcheId)
            ->with(['user', 'dossier', 'tache'])
            ->orderBy('date_evenement', 'desc')
            ->get()
            ->map(function($event) {
                return [
                    'type' => $event->type_evenement,
                    'description' => $event->description,
                    'user' => $event->user?->name ?? $event->role_utilisateur ?? 'Système',
                    'date' => $event->date_evenement->format('Y-m-d H:i:s'),
                    'commentaire' => $event->commentaire,
                    'dossier' => $event->dossier?->nom_dossier,
                    'tache' => $event->tache?->nom_tache,
                    'etape_precedente' => $event->etape_precedente,
                    'etape_nouvelle' => $event->etape_nouvelle,
                    'statut_precedent' => $event->statut_precedent,
                    'statut_nouveau' => $event->statut_nouveau,
                    'donnees_supplementaires' => $event->donnees_supplementaires,
                ];
            });

        return response()->json([
            'marche' => [
                'id' => $marche->id,
                'reference' => $marche->reference,
                'objet' => $marche->objet,
            ],
            'historique' => $historique,
        ]);
    }
}