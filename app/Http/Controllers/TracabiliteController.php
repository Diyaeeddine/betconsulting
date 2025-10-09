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
                        // ✅ Calculer le temps total réel depuis les affectations
                        $tempsTotal = AffectationTache::where('salarie_id', $participant->salarie_id)
                            ->whereHas('tache.dossier', function($q) use ($participant) {
                                $q->where('marche_id', $participant->marche_id);
                            })
                            ->get()
                            ->sum(function($affectation) {
                                if ($affectation->date_affectation) {
                                    $debut = \Carbon\Carbon::parse($affectation->date_affectation);
                                    $fin = $affectation->date_terminee 
                                        ? \Carbon\Carbon::parse($affectation->date_terminee) 
                                        : now();
                                    return round($debut->diffInHours($fin, true), 2);
                                }
                                return 0;
                            });

                        return [
                            'id' => $participant->id,
                            'nom' => $participant->salarie->nom_complet ?? 'Participant',
                            'role' => $participant->role_global,
                            'taches_affectees' => $participant->nb_taches_affectees,
                            'taches_terminees' => $participant->nb_taches_terminees,
                            'temps_passe' => round($tempsTotal, 2), // ✅ Temps réel calculé
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
    $dossier = DossierMarche::with(['fichiers.uploader', 'fichiers.tache', 'marchePublic'])
        ->findOrFail($dossierId);

    $fichiers = $dossier->fichiers->map(function($fichier) {
        return [
            'id' => $fichier->id,
            'nom_original' => $fichier->nom_original,
            'nom_fichier' => $fichier->nom_fichier,
            'type_mime' => $fichier->type_mime,
            'taille_fichier' => $fichier->taille_fichier,
            'date_upload' => $fichier->date_upload,
            'uploaded_by' => $fichier->uploader?->name ?? 'Service Marketing',
            'tache_associee' => $fichier->tache?->nom_tache ?? 'Offre Financière (Initial)',
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
        'taches.fichiers',
        'fichiers' // ✅ Charger les fichiers du dossier
    ])->findOrFail($dossierId);

    // ✅ Ajouter une tâche virtuelle si c'est le dossier financier et qu'il n'y a pas de tâches
    $taches = $dossier->taches;
    
    if ($dossier->type_dossier === 'financier' && $taches->isEmpty()) {
        // Récupérer les fichiers initiaux uploadés
        $fichiersInitiaux = $dossier->fichiers()->whereNull('tache_dossier_id')->get();
        
        if ($fichiersInitiaux->isNotEmpty()) {
            $tacheVirtuelle = (object) [
                'id' => 0,
                'nom_tache' => 'Upload Offre Financière (Service Marketing)',
                'description' => 'Fichiers de l\'offre financière uploadés lors de l\'acceptation du marché',
                'statut' => 'terminee',
                'priorite' => 'haute',
                'date_debut' => $fichiersInitiaux->first()->date_upload,
                'date_limite' => null,
                'date_fin' => $fichiersInitiaux->first()->date_upload,
                'duree_estimee' => 0,
                'duree_reelle' => 0,
                'nb_fichiers' => $fichiersInitiaux->count(),
                'affectations' => collect([[
                    'salarie_nom' => 'Service Marketing',
                    'role' => 'service_marketing',
                    'date_affectation' => $fichiersInitiaux->first()->date_upload->format('Y-m-d H:i'),
                    'date_terminee' => $fichiersInitiaux->first()->date_upload->format('Y-m-d H:i'),
                    'temps_passe' => 0,
                    'statut' => 'terminee',
                ]]),
                'est_en_retard' => false,
            ];
            
            $taches = collect([$tacheVirtuelle])->merge($taches);
        }
    }

    $tachesFormatted = $taches->map(function($tache) {
        $affectations = $tache->affectations->map(function($affectation) {
            $tempsPasse = null;
            if ($affectation->date_affectation && $affectation->date_terminee) {
                $debut = \Carbon\Carbon::parse($affectation->date_affectation);
                $fin = \Carbon\Carbon::parse($affectation->date_terminee);
                $tempsPasse = round($fin->diffInHours($debut), 2);
            }

            return [
                'salarie_nom' => $affectation->salarie->nom_complet ?? $affectation->salarie_nom ?? 'Inconnu',
                'role' => $affectation->role ?? $affectation->role_affectation ?? 'collaborateur',
                'date_affectation' => is_string($affectation->date_affectation) 
                    ? $affectation->date_affectation 
                    : $affectation->date_affectation?->format('Y-m-d H:i'),
                'date_terminee' => is_string($affectation->date_terminee)
                    ? $affectation->date_terminee
                    : $affectation->date_terminee?->format('Y-m-d H:i'),
                'temps_passe' => $tempsPasse,
                'statut' => $affectation->statut ?? 'terminee',
            ];
        });

        return [
            'id' => $tache->id,
            'nom_tache' => $tache->nom_tache,
            'description' => $tache->description ?? null,
            'statut' => $tache->statut,
            'priorite' => $tache->priorite,
            'date_debut' => $tache->date_debut ? (is_string($tache->date_debut) ? $tache->date_debut : $tache->date_debut->format('Y-m-d')) : null,
            'date_limite' => $tache->date_limite ? (is_string($tache->date_limite) ? $tache->date_limite : $tache->date_limite->format('Y-m-d')) : null,
            'date_fin' => $tache->date_fin ? (is_string($tache->date_fin) ? $tache->date_fin : $tache->date_fin->format('Y-m-d')) : null,
            'duree_estimee' => (float) $tache->duree_estimee,
            'duree_reelle' => (float) $tache->duree_reelle,
            'nb_fichiers' => $tache->nb_fichiers ?? ($tache->fichiers ? $tache->fichiers->count() : 0),
            'affectations' => $affectations,
            'est_en_retard' => $tache->est_en_retard ?? false,
        ];
    });

    return response()->json([
        'taches' => $tachesFormatted,
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
    $dossier = DossierMarche::with(['taches', 'fichiers'])->findOrFail($dossierId);
    $timeline = [];

    // ✅ Ajouter l'événement initial d'upload financier
    if ($dossier->type_dossier === 'financier') {
        $fichiersInitiaux = $dossier->fichiers()->whereNull('tache_dossier_id')->get();
        
        if ($fichiersInitiaux->isNotEmpty()) {
            $timeline[] = [
                'type' => 'affectation',
                'tache_nom' => 'Upload Offre Financière',
                'description' => "Fichiers de l'offre financière uploadés par le Service Marketing",
                'priorite' => 'haute',
                'salarie' => 'Service Marketing',
                'date' => $fichiersInitiaux->first()->date_upload,
                'temps_passe' => null,
            ];
        }
    }

    // Récupérer toutes les affectations
    $affectations = AffectationTache::whereHas('tache', function($query) use ($dossierId) {
        $query->where('dossier_marche_id', $dossierId);
    })
    ->with(['tache', 'salarie'])
    ->orderBy('date_affectation')
    ->get();

    foreach ($affectations as $affectation) {
        $timeline[] = [
            'type' => 'affectation',
            'tache_nom' => $affectation->tache->nom_tache,
            'description' => "Tâche affectée à " . $affectation->salarie->nom_complet,
            'priorite' => $affectation->tache->priorite,
            'salarie' => $affectation->salarie->nom_complet,
            'date' => $affectation->date_affectation,
            'temps_passe' => null,
        ];

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

    // 🔹 Construction de la requête de base
    $query = AffectationTache::where('salarie_id', $participation->salarie_id)
        ->whereHas('tache.dossier', function($q) use ($participation) {
            $q->where('marche_id', $participation->marche_id);
        })
        ->with(['tache.dossier']);

    // ✅ CORRECTION : Logique inversée
    // Si terminees_only=1 → Afficher SEULEMENT les tâches terminées
    // Sinon → Afficher TOUTES les tâches affectées
    if (request()->query('terminees_only') == '1') {
        $query->whereNotNull('date_terminee'); // Tâches terminées
    }

    $affectations = $query->get();

    $taches = $affectations->map(function($affectation) {
        $tache = $affectation->tache;
        $dossier = $tache->dossier;

        // Calculer temps passé avec format
        $tempsPasse = null;
        $tempsPasseFormate = 'N/A';
        
        if ($affectation->date_affectation) {
            $debut = \Carbon\Carbon::parse($affectation->date_affectation);
            
            if ($affectation->date_terminee) {
                $fin = \Carbon\Carbon::parse($affectation->date_terminee);
            } else {
                $fin = now();
            }
            
            $minutes = $debut->diffInMinutes($fin);
            $tempsPasse = round($debut->diffInHours($fin, true), 2);
            
            // Format lisible
            if ($minutes < 60) {
                $tempsPasseFormate = "{$minutes}min";
            } else {
                $heures = floor($minutes / 60);
                $mins = $minutes % 60;
                $tempsPasseFormate = "{$heures}h " . ($mins > 0 ? "{$mins}min" : "");
            }
        }

        $avancement = in_array($tache->statut, ['terminee', 'validee']) ? 100 : 
                     ($tache->statut === 'en_cours' ? 50 : 0);

        return [
            'tache_nom' => $tache->nom_tache,
            'statut' => $tache->statut,
            'priorite' => $tache->priorite,
            'dossier_nom' => $dossier->nom_dossier,
            'dossier_type' => $dossier->type_dossier,
            'date_affectation' => $affectation->date_affectation?->format('Y-m-d H:i'),
            'date_terminee' => $affectation->date_terminee?->format('Y-m-d H:i'),
            'temps_passe' => $tempsPasse,
            'temps_passe_formate' => $tempsPasseFormate,
            'avancement' => $avancement,
            'est_en_cours' => !$affectation->date_terminee,
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
        
        $minutes = $debut->diffInMinutes($fin);
        $tempsPasseHeures = round($debut->diffInHours($fin, true), 2);
        $tempsPasseJours = round($debut->diffInDays($fin, true), 1);

        // Format lisible
        if ($minutes < 60) {
            $tempsFormate = "{$minutes}min";
        } else if ($tempsPasseHeures < 24) {
            $heures = floor($minutes / 60);
            $mins = $minutes % 60;
            $tempsFormate = "{$heures}h " . ($mins > 0 ? "{$mins}min" : "");
        } else {
            $jours = floor($tempsPasseHeures / 24);
            $heures = floor($tempsPasseHeures % 24);
            $tempsFormate = "{$jours}j " . ($heures > 0 ? "{$heures}h" : "");
        }

        return [
            'tache_nom' => $affectation->tache->nom_tache,
            'dossier_nom' => $affectation->tache->dossier->nom_dossier,
            'dossier_type' => $affectation->tache->dossier->type_dossier,
            'date_debut' => $affectation->date_affectation->format('Y-m-d H:i'),
            'date_fin' => $affectation->date_terminee->format('Y-m-d H:i'),
            'temps_passe_heures' => $tempsPasseHeures,
            'temps_passe_jours' => $tempsPasseJours,
            'temps_passe_formate' => $tempsFormate,
            'temps_passe_minutes' => $minutes,
        ];
    });

    $tempsTotal = $details->sum('temps_passe_heures');
    $minutesTotal = $details->sum('temps_passe_minutes');
    
    // Format temps total
    if ($minutesTotal < 60) {
        $tempsTotalFormate = "{$minutesTotal}min";
    } else if ($tempsTotal < 24) {
        $heures = floor($minutesTotal / 60);
        $mins = $minutesTotal % 60;
        $tempsTotalFormate = "{$heures}h " . ($mins > 0 ? "{$mins}min" : "");
    } else {
        $jours = floor($tempsTotal / 24);
        $heures = floor($tempsTotal % 24);
        $tempsTotalFormate = "{$jours}j " . ($heures > 0 ? "{$heures}h" : "");
    }

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
        'temps_total_formate' => $tempsTotalFormate,
        'nb_taches_terminees' => $details->count(),
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

public function downloadFichier($fichierId)
{
    $fichier = DocumentDossier::findOrFail($fichierId);
    
    $filePath = storage_path('app/public/' . $fichier->chemin_fichier);
    
    if (!file_exists($filePath)) {
        return response()->json(['error' => 'Fichier introuvable'], 404);
    }
    
    return response()->download($filePath, $fichier->nom_original);
}
}