<?php

namespace App\Http\Controllers;

use App\Models\AffectationTache;
use App\Models\DossierMarche;
use App\Models\TacheDossier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SalarieController extends Controller
{
    public function index()
    {
        return Inertia::render('salarie/Dashboard');
    }

    /**
     * Afficher toutes les tâches affectées au salarié connecté
     */
    public function mesTachesMarches()
    {
        $salarieId = Auth::id();

        $affectations = AffectationTache::where('salarie_id', $salarieId)
            ->where('statut_affectation', 'active')
            ->with([
                'tache' => function($query) {
                    $query->with([
                        'dossier' => function($q) {
                            $q->with('marchePublic:id,reference,objet,maitre_ouvrage,date_limite_soumission,type_marche,zone_geographique');
                        }
                    ]);
                }
            ])
            ->orderBy('date_affectation', 'desc')
            ->get();

        return Inertia::render('salarie/MesTachesMarches', [
            'affectations' => $affectations,
        ]);
    }

    /**
     * Upload de fichiers pour une tâche
     */
    public function uploadFichiersTache(Request $request, $tacheId)
    {
        $request->validate([
            'fichiers' => 'required|array',
            'fichiers.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png'
        ]);

        $tache = TacheDossier::findOrFail($tacheId);

        // Vérifier que le salarié est bien affecté à cette tâche
        $affectation = AffectationTache::where('tache_dossier_id', $tacheId)
            ->where('salarie_id', Auth::id())
            ->where('statut_affectation', 'active')
            ->first();

        if (!$affectation) {
            return back()->withErrors(['error' => 'Vous n\'êtes pas autorisé à modifier cette tâche']);
        }

        $fichiersProduits = $tache->fichiers_produits ?? [];

        foreach ($request->file('fichiers') as $fichier) {
            $nomOriginal = $fichier->getClientOriginalName();
            $path = $fichier->storeAs(
                "marches/taches/{$tacheId}",
                time() . '_' . $nomOriginal,
                'public'
            );
            $fichiersProduits[] = $path;
        }

        $updateData = [
            'fichiers_produits' => $fichiersProduits
        ];

        // Passer automatiquement en "en_cours" si c'était "en_attente"
        if ($tache->statut === 'en_attente') {
            $updateData['statut'] = 'en_cours';
            $updateData['date_debut'] = now();
        }

        $tache->update($updateData);

        // Recalculer l'avancement du dossier
        $dossier = DossierMarche::find($tache->dossier_marche_id);
        $dossier->refresh();
        $dossier->calculerAvancement();

        return back()->with('success', 'Fichier(s) téléchargé(s) avec succès');
    }

    /**
     * Marquer une tâche comme terminée
     */
    
    public function marquerTacheTerminee(Request $request, $tacheId)
    {
        $tache = TacheDossier::findOrFail($tacheId);

        // Vérifier que le salarié est bien affecté à cette tâche
        $affectation = AffectationTache::where('tache_dossier_id', $tacheId)
            ->where('salarie_id', Auth::id())
            ->where('statut_affectation', 'active')
            ->first();

        if (!$affectation) {
            return back()->withErrors(['error' => 'Vous n\'êtes pas autorisé à modifier cette tâche']);
        }

        // Vérifier qu'il y a au moins un fichier déposé
        if (empty($tache->fichiers_produits)) {
            return back()->withErrors(['error' => 'Vous devez déposer au moins un fichier avant de marquer la tâche comme terminée']);
        }

        $tache->update([
            'statut' => 'terminee',
            'date_fin' => now()
        ]);

        // Enregistrer dans le suivi
        $tache->suivis()->create([
            'salarie_id' => Auth::id(),
            'type_action' => 'finalisation',
            'commentaire' => 'Tâche marquée comme terminée',
            'date_action' => now()
        ]);

        // Recalculer l'avancement du dossier
        $dossier = DossierMarche::find($tache->dossier_marche_id);
        $dossier->refresh();
        $dossier->calculerAvancement();

        return back()->with('success', 'Tâche marquée comme terminée');
    }

    /**
     * Télécharger un fichier produit
     */
    public function telechargerFichierTache($tacheId, Request $request)
    {
        $request->validate([
            'fichier' => 'required|string'
        ]);

        $tache = TacheDossier::findOrFail($tacheId);

        // Vérifier que le salarié est bien affecté à cette tâche
        $affectation = AffectationTache::where('tache_dossier_id', $tacheId)
            ->where('salarie_id', Auth::id())
            ->where('statut_affectation', 'active')
            ->first();

        if (!$affectation) {
            abort(403, 'Non autorisé');
        }

        $fichier = $request->input('fichier');

        if (!Storage::disk('public')->exists($fichier)) {
            abort(404, 'Fichier introuvable');
        }

        return Storage::disk('public')->download($fichier);
    }
}