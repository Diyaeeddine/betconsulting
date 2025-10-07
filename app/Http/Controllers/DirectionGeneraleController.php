<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\MarchePublic;
use App\Models\User;
use App\Models\Salarie;
use App\Models\HistoriqueMarche;
// use App\Notifications\MarcheDecisionNotification;
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
    public function profileDecision(){

        $salaries = Salarie::
        where('is_accepted', false)
        ->get();
            
        return Inertia::render('direction-generale/ProfileDecision', [
            'salaries' => $salaries
        ]);
    }
public function handleProfileDecision(Salarie $salarie, Request $request)
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
        return redirect()->back()->with('info', 'Profil de ' . $fullName . ' rejeté doit le modifier.');
    }
}

    // public function accepterMarche(Request $request, $id)
    // {
    //     try {
    //         // Trouver le marché
    //         $marche = MarchePublic::findOrFail($id);
            
    //         // Mettre à jour l'étape
    //         $marche->update([
    //             'etape' => 'preparation',
    //             'date_decision' => now(),
    //         ]);

    //         return redirect()->back()->with('success', 'Marché accepté avec succès');

    //     } catch (\Exception $e) {
    //         return redirect()->back()->withErrors(['error' => 'Erreur lors de l\'acceptation du marché: ' . $e->getMessage()]);
    //     }
    // }

    public function approuverFinal(Request $request, $id)
{
    try {
        $request->validate([
            'commentaire' => 'required|string|max:1000'
        ]);

        $marche = MarchePublic::findOrFail($id);
        
        
        $marche->update([
            'etape' => 'preparation',
            'date_decision' => now()
        ]);

        $dossierFinancier = $marche->dossiers()
            ->where('type_dossier', 'financier')
            ->first();

        if ($dossierFinancier) {
            $dossierFinancier->update([
                'statut' => 'valide',
                'commentaires' => $request->commentaire,
                'date_finalisation' => now()
            ]);
        }

        HistoriqueMarche::enregistrer(
            marcheId: $marche->id,
            typeEvenement: 'approbation_finale',
            description: "Marché approuvé par la Direction Générale",
            dossierId: $dossierFinancier->id,
            commentaire: $request->commentaire
        );

        return redirect()->back()->with('success', 'Marché approuvé avec succès. Commentaire envoyé au service marché marketing.');
        
    } catch (\Exception $e) {
        return redirect()->back()->withErrors(['error' => 'Erreur lors de l\'approbation finale : ' . $e->getMessage()]);
    }
}

public function demanderModification(Request $request, $id)
{
    try {
        $request->validate([
            'commentaire' => 'required|string|max:1000'
        ]);

        $marche = MarchePublic::findOrFail($id);

        $marche->update([
            'etape' => 'preparation',
            'date_decision' => now()
        ]);

        $dossierFinancier = $marche->dossiers()
            ->where('type_dossier', 'financier')
            ->first();

        if (!$dossierFinancier) {
            return redirect()->back()->withErrors(['error' => 'Aucun dossier financier trouvé pour ce marché.']);
        }

        $dossierFinancier->update([
            'statut' => 'modification_requis',
            'commentaires' => $request->commentaire
        ]);
        HistoriqueMarche::enregistrer(
            marcheId: $marche->id,
            typeEvenement: 'demande_modification_dg',
            description: "Modification demandée par la Direction Générale",
            dossierId: $dossierFinancier->id,
            commentaire: $request->commentaire
        );

        return redirect()->back()->with('success', 'Demande de modification envoyée avec succès au service marché marketing.');
        
    } catch (\Exception $e) {
        return redirect()->back()->withErrors(['error' => 'Erreur lors de la demande de modification : ' . $e->getMessage()]);
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
        
        // APRÈS le update, AVANT les notifications :
        HistoriqueMarche::enregistrer(
            marcheId: $marche->id,
            typeEvenement: 'refus_dg',
            description: "Marché refusé par la Direction Générale",
            commentaire: $request->input('motif'),
            donneesSupp: [
                'decision' => 'refuse'
            ]
        );

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
}