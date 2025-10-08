<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\MarchePublic;
use App\Models\User;
use App\Models\Salarie;
use App\Models\Entretien;


use App\Notifications\MarcheDecisionNotification;
use Carbon\Carbon;

class DirectionGeneraleController extends Controller
{
    public function index()
    {
        return Inertia::render('direction-generale/Dashboard');
    }

public function boiteDecision()
{
     
    return Inertia::render('direction-generale/BoiteDecision');
           
}

public function marcheDecision(){
    try {
        $marchesPublics = MarchePublic::with(['dossiers' => function($query) {
                $query->where('type_dossier', 'financier')
                      ->orderBy('created_at', 'desc');
            }])
            ->where('is_accepted', true)
            ->where('etat', 'en cours')
            ->where('etape', 'decision admin')
            ->orderByRaw('CASE 
                WHEN urgence = "elevee" THEN 1 
                WHEN urgence = "moyenne" THEN 2 
                WHEN urgence = "faible" THEN 3 
                ELSE 4 
                END')
            ->orderBy('date_limite_soumission', 'asc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($marche) {
                // Transformer les données pour une meilleure utilisation côté client
                $marche->dossiers = $marche->dossiers->map(function ($dossier) {
                    // Décoder les fichiers joints
                    if ($dossier->fichiers_joints) {
                        $dossier->fichiers_joints = is_string($dossier->fichiers_joints) 
                            ? json_decode($dossier->fichiers_joints, true) 
                            : $dossier->fichiers_joints;
                    } else {
                        $dossier->fichiers_joints = [];
                    }
                    
                    return $dossier;
                });
                
                // Calculer l'urgence basée sur la date limite
                if ($marche->date_limite_soumission) {
                    $dateLimit = Carbon::parse($marche->date_limite_soumission);
                    $today = Carbon::now();
                    $diffInDays = $today->diffInDays($dateLimit, false);
                    
                    // Ajouter une propriété calculated_urgency pour l'interface
                    if ($diffInDays <= 0) {
                        $marche->calculated_urgency = 'expired';
                    } elseif ($diffInDays <= 3) {
                        $marche->calculated_urgency = 'critical';
                    } elseif ($diffInDays <= 7) {
                        $marche->calculated_urgency = 'urgent';
                    } else {
                        $marche->calculated_urgency = 'normal';
                    }
                    
                    $marche->days_remaining = $diffInDays;
                } else {
                    $marche->calculated_urgency = 'unknown';
                    $marche->days_remaining = null;
                }
                
                // Ajouter des métadonnées utiles
                $marche->has_financial_dossier = $marche->dossiers->isNotEmpty();
                $marche->total_files = $marche->dossiers->sum(function ($dossier) {
                    return count($dossier->fichiers_joints ?? []);
                });
                
                return $marche;
            });
            
        return Inertia::render('direction-generale/MarcheDecision', [
            'marches' => $marchesPublics,
            'stats' => [
                'total' => $marchesPublics->count(),
                'urgent' => $marchesPublics->where('calculated_urgency', 'urgent')->count(),
                'critical' => $marchesPublics->where('calculated_urgency', 'critical')->count(),
                'expired' => $marchesPublics->where('calculated_urgency', 'expired')->count(),
                'with_files' => $marchesPublics->where('has_financial_dossier', true)->count(),
            ]
        ]);
        
    } catch (\Exception $e) {
        // Log l'erreur pour debug
        \Log::error('Erreur dans marcheDecision: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        
        return Inertia::render('direction-generale/MarcheDecision', [
            'marches' => [],
            'stats' => [
                'total' => 0,
                'urgent' => 0,
                'critical' => 0,
                'expired' => 0,
                'with_files' => 0,
            ],
            'error' => 'Une erreur est survenue lors du chargement des marchés.'
        ]);
    }
}
    public function SalarieDecision(){

        $salaries = Salarie::
        where('is_accepted', false)
        ->get();
            
        return Inertia::render('direction-generale/SalarieDecision', [
            'salaries' => $salaries
        ]);
    }
public function handleSalarieDecision(Salarie $salarie, Request $request)
{
    $request->validate([
        'decision' => 'required|in:accept,reject'
    ]);

    $decision = $request->input('decision');
    
    $fullName = $salarie->prenom . ' ' . $salarie->nom;

    if ($decision === 'accept') {
        $salarie->update(['is_accepted' => true]);
        return redirect()->back()->with('success', 'Profil de ' . $fullName . ' accepté avec succès !');
    } else {
        $salarie->delete();
        return redirect()->back()->with('info', 'Profil de ' . $fullName . ' rejeté et supprimé.');
    }
}

    public function accepterMarche(Request $request, $id)
    {
        try {
            // Trouver le marché
            $marche = MarchePublic::findOrFail($id);
            
            // Mettre à jour l'étape
            $marche->update([
                'etape' => 'preparation',
                'decision' => 'accepte',
                'date_decision' => now(),
                'ordre_preparation' => 'preparation_dossier_administratif'
            ]);

            // Trouver l'utilisateur des études techniques
            $etudesTechniques = User::whereHas('roles', function($query) {
                $query->where('name', 'etudes-techniques');
            })->first();

            if ($etudesTechniques) {
                // Envoyer la notification de décision
                $etudesTechniques->notify(new MarcheDecisionNotification($marche, 'accepte'));
            }

            return redirect()->back()->with('success', 'Marché accepté avec succès');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Erreur lors de l\'acceptation du marché: ' . $e->getMessage()]);
        }
    }

    public function refuserMarche(Request $request, $id)
{
    // Validation du motif
    $request->validate([
        'motif' => 'required|string|min:5|max:500'
    ], [
        'motif.required' => 'Le motif de refus est obligatoire',
        'motif.min' => 'Le motif doit contenir au moins 5 caractères',
        'motif.max' => 'Le motif ne peut pas dépasser 500 caractères'
    ]);

    try {
        $marche = MarchePublic::findOrFail($id);
        
        // Vérifier que le marché n'a pas déjà été traité
        if ($marche->decision && $marche->decision !== 'en_attente') {
            return redirect()->back()->withErrors(['error' => 'Ce marché a déjà été traité']);
        }
        
        $marche->update([
            'decision' => 'refuse',
            'date_decision' => now(),
            'etape' => 'cloture',
            'etat' => 'refuse',
            'motif_refus' => $request->input('motif'), // Nouvelle colonne pour le motif de refus
            'commentaire_refus' => $request->input('motif') // Garder aussi l'ancienne pour compatibilité si nécessaire
        ]);


        $etudesTechniques = User::whereHas('roles', function($query) {
            $query->where('name', 'etudes-techniques');
        })->get();

        foreach ($etudesTechniques as $user) {
            $user->notify(new MarcheDecisionNotification($marche, 'refuse', $request->input('motif')));
        }

        $direction = User::whereHas('roles', function($query) {
            $query->where('name', 'direction');
        })->get();

        foreach ($direction as $user) {
            $user->notify(new MarcheDecisionNotification($marche, 'refuse', $request->input('motif')));
        }

        return redirect()->back()->with('success', 'Marché refusé avec succès. La justification a été enregistrée et toutes les équipes ont été notifiées.');

    } catch (\Exception $e) {
        \Log::error('Erreur lors du refus de marché', [
            'marche_id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'admin_id' => auth()->id()
        ]);
        
        return redirect()->back()->withErrors(['error' => 'Erreur lors du refus du marché: ' . $e->getMessage()]);
    }
}

####################################################################################################
####################################################################################################
####################################################################################################
####################################################################################################
####################################################################################################


 public function entretiensValidation()
    {
        $entretiens = Entretien::with(['salarie' => function($query) {
                $query->select('id', 'nom', 'prenom', 'email', 'poste', 'telephone');
            }])
            ->where('statut', 'en_attente_validation')
            ->orderBy('date_entretien', 'desc')
            ->get()
            ->map(function ($entretien) {
                return [
                    'id' => $entretien->id,
                    'salarie' => $entretien->salarie,
                    'salarie_nom' => $entretien->salarie->nom_complet,
                    'poste_vise' => $entretien->poste_vise,
                    'date_entretien' => $entretien->date_entretien->format('Y-m-d'),
                    'date_entretien_formatted' => $entretien->date_entretien->format('d/m/Y'),
                    'type_entretien' => $entretien->type_entretien,
                    'type_entretien_libelle' => $entretien->type_entretien_libelle,
                    'score_total' => $entretien->score_total,
                    'pourcentage_score' => $entretien->pourcentage_score,
                    'appreciation' => $entretien->appreciation,
                    'couleur_score' => $entretien->couleur_score,
                    'recommandation' => $entretien->recommandation,
                    'statut' => $entretien->statut,
                    'created_at' => $entretien->created_at->format('d/m/Y'),
                ];
            });

        return Inertia::render('direction-generale/SalarieDecision', [
            'entretiens' => $entretiens,
        ]);
    }

    /**
     * Afficher les détails d'un entretien
     */
    public function showEntretien(Entretien $entretien)
    {
        $entretien->load(['salarie' => function($query) {
            $query->select('id', 'nom', 'prenom', 'email', 'poste', 'telephone', 'date_embauche',
                          'contrat_cdi_path', 'cv_path', 'diplome_path', 'certificat_travail_path');
        }]);

        // Get documents from salarie (not entretien)
        $documents = [
            'contrat_cdi' => $entretien->salarie->contrat_cdi_path ? [
                'path' => $entretien->salarie->contrat_cdi_path,
                'url' => Storage::url($entretien->salarie->contrat_cdi_path),
                'exists' => Storage::exists($entretien->salarie->contrat_cdi_path),
            ] : null,
            'cv' => $entretien->salarie->cv_path ? [
                'path' => $entretien->salarie->cv_path,
                'url' => Storage::url($entretien->salarie->cv_path),
                'exists' => Storage::exists($entretien->salarie->cv_path),
            ] : null,
            'diplome' => $entretien->salarie->diplome_path ? [
                'path' => $entretien->salarie->diplome_path,
                'url' => Storage::url($entretien->salarie->diplome_path),
                'exists' => Storage::exists($entretien->salarie->diplome_path),
            ] : null,
            'certificat_travail' => $entretien->salarie->certificat_travail_path ? [
                'path' => $entretien->salarie->certificat_travail_path,
                'url' => Storage::url($entretien->salarie->certificat_travail_path),
                'exists' => Storage::exists($entretien->salarie->certificat_travail_path),
            ] : null,
        ];

        return Inertia::render('direction-generale/EntretienDetails', [
            'entretien' => [
                'id' => $entretien->id,
                'salarie' => $entretien->salarie,
                'salarie_nom' => $entretien->salarie->nom_complet,
                'poste_vise' => $entretien->poste_vise,
                'date_entretien' => $entretien->date_entretien->format('Y-m-d'),
                'date_entretien_formatted' => $entretien->date_entretien->format('d/m/Y'),
                'type_entretien' => $entretien->type_entretien,
                'type_entretien_libelle' => $entretien->type_entretien_libelle,
                'evaluateur_principal' => $entretien->evaluateur_principal,
                'expert_technique' => $entretien->expert_technique,
                'responsable_rh' => $entretien->responsable_rh,
                'scores_techniques' => $entretien->scores_techniques,
                'scores_comportementaux' => $entretien->scores_comportementaux,
                'scores_adequation' => $entretien->scores_adequation,
                'score_technique' => $entretien->score_technique,
                'score_comportemental' => $entretien->score_comportemental,
                'score_adequation' => $entretien->score_adequation,
                'score_total' => $entretien->score_total,
                'pourcentage_score' => $entretien->pourcentage_score,
                'appreciation' => $entretien->appreciation,
                'couleur_score' => $entretien->couleur_score,
                'points_forts' => $entretien->points_forts,
                'points_vigilance' => $entretien->points_vigilance,
                'recommandation' => $entretien->recommandation,
                'statut' => $entretien->statut,
                'statut_libelle' => $entretien->statut_libelle,
                'documents' => $documents,
                'created_at' => $entretien->created_at->format('d/m/Y'),
            ],
        ]);
    }

    /**
     * Valider un entretien
     */
    public function validerEntretien(Request $request, Entretien $entretien)
    {
        $validated = $request->validate([
            'commentaire_validation' => 'nullable|string',
            'accepter_salarie' => 'required|boolean',
        ]);

        $entretien->update([
            'statut' => 'validee',
            'commentaire_validation' => $validated['commentaire_validation'] ?? null,
            'valide_par' => auth()->user()->name,
            'valide_le' => now(),
        ]);

        // Si accepté, mettre à jour le salarié
        if ($validated['accepter_salarie']) {
            $entretien->salarie->update([
                'is_accepted' => true,
                'statut' => 'actif',
            ]);

            // Notifier RH de l'acceptation
            $rh = User::role('ressources-humaines')->get();
            foreach ($rh as $user) {
                $user->notify(new \App\Notifications\EntretienValideNotification($entretien, true));
            }
        } else {
            // Notifier RH du refus
            $rh = User::role('ressources-humaines')->get();
            foreach ($rh as $user) {
                $user->notify(new \App\Notifications\EntretienValideNotification($entretien, false));
            }
        }

        // Marquer la notification comme lue
        auth()->user()->unreadNotifications()
            ->where('data->document_id', $entretien->id)
            ->where('data->document_type', 'entretien')
            ->update(['read_at' => now()]);

        return redirect()
            ->route('direction-generale.entretiens.validation')
            ->with('success', 'Entretien validé avec succès.');
    }

    /**
     * Rejeter un entretien
     */
    public function rejeterEntretien(Request $request, Entretien $entretien)
    {
        $validated = $request->validate([
            'motif_rejet' => 'required|string',
        ]);

        $entretien->update([
            'statut' => 'rejete',
            'motif_rejet' => $validated['motif_rejet'],
            'rejete_par' => auth()->user()->name,
            'rejete_le' => now(),
        ]);

        // Notifier RH du rejet
        $rh = User::role('ressources-humaines')->get();
        foreach ($rh as $user) {
            $user->notify(new \App\Notifications\EntretienRejeteNotification($entretien));
        }

        // Marquer la notification comme lue
        auth()->user()->unreadNotifications()
            ->where('data->document_id', $entretien->id)
            ->where('data->document_type', 'entretien')
            ->update(['read_at' => now()]);

        return redirect()
            ->route('direction-generale.entretiens.validation')
            ->with('success', 'Entretien rejeté.');
    }

    /**
     * Export PDF d'un entretien
     */
    public function exportEntretien(Entretien $entretien)
    {
        $entretien->load(['salarie' => function($query) {
            $query->select('id', 'nom', 'prenom', 'email', 'poste', 'telephone', 'date_embauche');
        }]);

        return Inertia::render('direction-generale/ExportEntretienPDF', [
            'entretien' => [
                'id' => $entretien->id,
                'salarie' => $entretien->salarie,
                'poste_vise' => $entretien->poste_vise,
                'date_entretien' => $entretien->date_entretien->format('Y-m-d'),
                'date_entretien_formatted' => $entretien->date_entretien->format('d/m/Y'),
                'type_entretien' => $entretien->type_entretien,
                'type_entretien_libelle' => $entretien->type_entretien_libelle,
                'evaluateur_principal' => $entretien->evaluateur_principal,
                'expert_technique' => $entretien->expert_technique,
                'responsable_rh' => $entretien->responsable_rh,
                'scores_techniques' => $entretien->scores_techniques,
                'scores_comportementaux' => $entretien->scores_comportementaux,
                'scores_adequation' => $entretien->scores_adequation,
                'score_technique' => $entretien->score_technique,
                'score_comportemental' => $entretien->score_comportemental,
                'score_adequation' => $entretien->score_adequation,
                'score_total' => $entretien->score_total,
                'pourcentage_score' => $entretien->pourcentage_score,
                'appreciation' => $entretien->appreciation,
                'points_forts' => $entretien->points_forts,
                'points_vigilance' => $entretien->points_vigilance,
                'recommandation' => $entretien->recommandation,
                'statut' => $entretien->statut,
                'statut_libelle' => $entretien->statut_libelle,
                'created_at' => $entretien->created_at->format('d/m/Y'),
            ],
        ]);
    }

    /**
     * Download document for an entretien
     */
    public function downloadDocument(Entretien $entretien, string $type)
    {
        $salarie = $entretien->salarie;
        
        // Map type to the correct field name
        $pathField = match($type) {
            'contrat_cdi' => 'contrat_cdi_path',
            'cv' => 'cv_path',
            'diplome' => 'diplome_path',
            'certificat_travail' => 'certificat_travail_path',
            default => null,
        };
        
        if (!$pathField) {
            return redirect()->back()->with('error', 'Type de document invalide');
        }
        
        $path = $salarie->$pathField;
        
        if (!$path || !Storage::exists($path)) {
            \Log::error('Document not found', [
                'type' => $type,
                'path' => $path,
                'salarie_id' => $salarie->id,
            ]);
            return redirect()->back()->with('error', 'Document non trouvé');
        }
        
        $filename = basename($path);
        return Storage::download($path, $filename);
    }

###################################################################################################
###################################################################################################
###################################################################################################
###################################################################################################
###################################################################################################







}   