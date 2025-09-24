<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\MarchePublic;
use App\Models\User;
use App\Notifications\MarcheDecisionNotification;

class DirectionGeneraleController extends Controller
{
    public function index()
    {
        return Inertia::render('direction-generale/Dashboard');
    }

public function boiteDecision()
{
    try {
        $marchesPublics = MarchePublic::where('is_accepted', true)
            ->where('etat', 'en cours')
            ->where('etape', 'decision admin')
            ->orderBy('created_at', 'desc')
            ->get();

        // Debug : vérifiez ce qui est retourné
        \Log::info('Marchés publics pour boite décision:', ['count' => $marchesPublics->count()]);

        return Inertia::render('direction-generale/BoiteDecision', [
            'marchesPublics' => $marchesPublics
        ]);
    } catch (\Exception $e) {
        \Log::error('Erreur dans boiteDecision:', ['error' => $e->getMessage()]);
        return Inertia::render('direction-generale/BoiteDecision', [
            'marchesPublics' => []
        ]);
    }
}

    public function accepterMarche(Request $request, $id)
    {
        try {
            // Trouver le marché
            $marche = MarchePublic::findOrFail($id);
            
            // Mettre à jour l'étape
            $marche->update([
                'etape' => 'etudes-techniques',
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

        // Log de l'action pour audit
        \Log::info('Marché refusé par admin', [
            'marche_id' => $id,
            'marche_reference' => $marche->n_reference,
            'motif_refus' => $request->input('motif'),
            'admin_id' => auth()->id(),
            'admin_name' => auth()->user()->name,
            'date_refus' => now()
        ]);

        // Notifier l'équipe études techniques du refus
        $etudesTechniques = User::whereHas('roles', function($query) {
            $query->where('name', 'etudes-techniques');
        })->get(); // Utiliser get() pour récupérer tous les utilisateurs

        foreach ($etudesTechniques as $user) {
            $user->notify(new MarcheDecisionNotification($marche, 'refuse', $request->input('motif')));
        }

        // Optionnel: Notifier aussi la direction si nécessaire
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