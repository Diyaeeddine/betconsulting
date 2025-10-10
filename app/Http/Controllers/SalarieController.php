<?php

namespace App\Http\Controllers;

use App\Models\AffectationTache;
use App\Models\DossierMarche;
use App\Models\TacheDossier;
use App\Models\Conge;
use App\Models\CertificatMedical;
use App\Models\HistoriqueMarche;
use App\Models\DocumentDossier;
use App\Models\ParticipationMarche;
use Illuminate\Http\Request;
use Carbon\Carbon;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SalarieController extends Controller
{
            public function index()
        {
            $salarie = auth('salarie')->user();
            
            // Récupérer les statistiques des tâches
            $tachesAujourdhui = $salarie->affectations()
                ->whereHas('tache', function($query) {
                    $query->whereDate('date_limite', Carbon::today())
                        ->whereNotIn('statut', ['terminee', 'validee']);
                })
                ->count();
            
            $tachesTotales = $salarie->affectations()->count();
            
            $tachesTerminees = $salarie->affectations()
                ->whereHas('tache', function($query) {
                    $query->whereIn('statut', ['terminee', 'validee']);
                })
                ->count();
            
            return Inertia::render('salarie/Profile', [
                'salarie' => [
                    'id' => $salarie->id,
                    'nom' => $salarie->nom,
                    'prenom' => $salarie->prenom,
                    'matricule' => 'MAT-' . str_pad($salarie->id, 6, '0', STR_PAD_LEFT),
                    'email' => $salarie->email,
                    'telephone' => $salarie->telephone,
                    'poste' => $salarie->poste,
                    'service' => $salarie->nom_profil ?? 'Non défini',
                    'date_embauche' => $salarie->date_embauche?->format('d/m/Y'),
                    'statut' => $salarie->statut,
                ],
                'horaires' => [
                    'debut' => '08:00',
                    'fin' => '17:00',
                    'jours_travail' => 'Lundi - Vendredi',
                ],
                'statistiques' => [
                    'taches_aujourdhui' => $tachesAujourdhui,
                    'taches_totales' => $tachesTotales,
                    'taches_terminees' => $tachesTerminees,
                    'taux_completion' => $tachesTotales > 0 
                        ? round(($tachesTerminees / $tachesTotales) * 100, 1) 
                        : 0,
                ],
            ]);
        }
    
    public function demanderConge(Request $request)
    {
        $validated = $request->validate([
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after:date_debut',
            'type' => 'required|in:conge_annuel,conge_maladie,conge_sans_solde',
            'motif' => 'nullable|string|max:500',
        ]);
        
        $salarie = auth('salarie')->user();
        
        Conge::create([
            'salarie_id' => $salarie->id,
            'date_debut' => $validated['date_debut'],
            'date_fin' => $validated['date_fin'],
            'type' => $validated['type'],
            'motif' => $validated['motif'] ?? null,
            'statut' => 'en_attente',
        ]);
        
        return back()->with('success', 'Demande de congé envoyée avec succès');
    }
    
    public function demanderCertificatMaladie(Request $request)
    {
        $validated = $request->validate([
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'certificat' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'description' => 'nullable|string|max:500',
        ]);
        
        $salarie = auth('salarie')->user();
        
        // Stocker le fichier
        $fichier = $request->file('certificat');
        $nomFichier = time() . '_' . $salarie->id . '_' . $fichier->getClientOriginalName();
        $chemin = $fichier->storeAs('certificats_medicaux', $nomFichier, 'public');
        
        CertificatMedical::create([
            'salarie_id' => $salarie->id,
            'date_debut' => $validated['date_debut'],
            'date_fin' => $validated['date_fin'],
            'fichier_path' => $chemin,
            'fichier_original' => $fichier->getClientOriginalName(),
            'description' => $validated['description'] ?? null,
            'statut' => 'en_attente',
        ]);
        
        return back()->with('success', 'Certificat médical envoyé avec succès');
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
                    },
                    // ✅ Ajout de la relation documents
                    'documents' => function($q) {
                        $q->select('id', 'tache_dossier_id', 'nom_original', 'nom_fichier', 'chemin_fichier', 'type_mime', 'taille_fichier', 'date_upload')
                        ->orderBy('date_upload', 'desc');
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
    public function showDossier($dossierId, Request $request)
{
    $salarieId = Auth::id(); 
    
    $dossier = DossierMarche::with(['marchePublic']) 
        ->findOrFail($dossierId);
    
    $affectations = AffectationTache::with(['tache'])
        ->where('salarie_id', $salarieId)
        ->where('statut_affectation', 'active')
        ->whereHas('tache', function ($query) use ($dossierId) {
            $query->where('dossier_marche_id', $dossierId);
        })
        ->get();
    
    $highlightedTacheId = $request->input('tache_id');
    
    return Inertia::render('salarie/DetailDossierTaches', [
        'dossier' => $dossier,
        'affectations' => $affectations,
        'highlightedTacheId' => $highlightedTacheId ? (int) $highlightedTacheId : null,
    ]);
}
    public function show($tacheId)
    {
        $tache = TacheDossier::with(['dossier'])->findOrFail($tacheId);
        $dossierId = $tache->dossier_marche_id;
        
        // Rediriger vers la vue du dossier avec la tâche mise en évidence
        return redirect()->route('salarie.marches.dossier', [
            'dossier' => $dossierId,
            'tache_id' => $tacheId
        ]);
    }


public function uploadFichiersTache(Request $request, $tacheId)
{
    $request->validate([
        'fichiers' => 'required|array',
        'fichiers.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,zip'
    ]);

    $tache = TacheDossier::findOrFail($tacheId);

    $affectation = AffectationTache::where('tache_dossier_id', $tacheId)
        ->where('salarie_id', Auth::id())
        ->where('statut_affectation', 'active')
        ->first();

    if (!$affectation) {
        return back()->withErrors(['error' => 'Vous n\'êtes pas autorisé à modifier cette tâche.']);
    }

    // ✅ Variable pour stocker les noms des fichiers uploadés
    $fichiersProduits = [];

    foreach ($request->file('fichiers') as $fichier) {
        $nomOriginal = $fichier->getClientOriginalName();
        $nomFichierStocke = time() . '_' . $nomOriginal;

        $path = $fichier->storeAs(
            "marches/taches/{$tacheId}",
            $nomFichierStocke,
            'public'
        );

        // ✅ Sauvegarde dans la table documents_dossier
        DocumentDossier::create([
            'dossier_marche_id' => $tache->dossier_marche_id,
            'tache_dossier_id' => $tacheId,
            'type_attachment' => 'fichier_specifique',
            'nom_fichier' => $nomFichierStocke,
            'nom_original' => $nomOriginal,
            'chemin_fichier' => $path,
            'type_mime' => $fichier->getMimeType(),
            'taille_fichier' => $fichier->getSize(),
            'uploaded_by' => Auth::id(),
            'date_upload' => now(),
        ]);

        $fichiersProduits[] = $nomOriginal;
    }

    // ✅ Enregistrer dans l'historique
    HistoriqueMarche::enregistrer(
        marcheId: $tache->dossier->marche_id,
        typeEvenement: 'upload_fichier',
        description: "Fichier(s) uploadé(s) pour la tâche '{$tache->nom_tache}'.",
        dossierId: $tache->dossier_marche_id,
        tacheId: $tacheId,
        donneesSupp: [
            'nb_fichiers' => count($fichiersProduits),
            'noms_fichiers' => $fichiersProduits,
            'tache_statut' => $tache->statut,
        ]
    );

    // ✅ Mise à jour du statut de la tâche
    $updateData = [];

    // Si la tâche était en attente → passer en cours
    if ($tache->statut === 'en_attente') {
        $updateData['statut'] = 'en_cours';
        $updateData['date_debut'] = now();
    }

    $tache->update($updateData);

    // ✅ Recalculer l’avancement du dossier
    $dossier = $tache->dossier;
    $dossier->calculerAvancement();

    return back()->with('success', 'Fichier(s) téléchargé(s) avec succès.');
}



    
    
public function marquerTacheTerminee(Request $request, $tacheId)
{
    $tache = TacheDossier::findOrFail($tacheId);

    $affectation = AffectationTache::where('tache_dossier_id', $tacheId)
        ->where('salarie_id', Auth::id())
        ->where('statut_affectation', 'active')
        ->first();

    if (!$affectation) {
        return back()->withErrors(['error' => 'Vous n\'êtes pas autorisé à modifier cette tâche']);
    }

    $nbDocuments = DocumentDossier::where('tache_dossier_id', $tacheId)->count();
    
    if ($nbDocuments === 0 && empty($tache->fichiers_produits)) {
        return back()->withErrors(['error' => 'Vous devez déposer au moins un fichier avant de marquer la tâche comme terminée']);
    }

    $dossier = $tache->dossier;

    // 🔹 Marquer la tâche terminée
    $tache->update([
        'statut' => 'terminee',
        'date_fin' => now(),
    ]);

    // 🔹 Mettre à jour la date de fin dans l'affectation
    $affectation->update([
        'date_terminee' => now(),
    ]);

    // 🔹 Mettre à jour la participation
    $participation = ParticipationMarche::where('marche_id', $dossier->marche_id)
        ->where('salarie_id', Auth::id())
        ->first();

    if ($participation) {
        $participation->increment('nb_taches_terminees');

        $tempsPasse = $tache->suivis()
            ->where('salarie_id', Auth::id())
            ->sum('temps_passe');

        if ($tempsPasse > 0) {
            $participation->increment('temps_total_passe', $tempsPasse);
        }
    }

    // 🔹 Historiser l’action
    HistoriqueMarche::enregistrer(
        marcheId: $dossier->marche_id,
        typeEvenement: 'finalisation_tache',
        description: "Tâche '{$tache->nom_tache}' terminée par " . Auth::user()->nom . ' ' . Auth::user()->prenom,
        dossierId: $dossier->id,
        tacheId: $tacheId,
        donneesSupp: [
            'duree_reelle' => $tache->duree_reelle,
            'nb_fichiers' => $nbDocuments,
        ]
    );

    // 🔹 Ajouter un suivi si disponible
    if (method_exists($tache, 'suivis')) {
        $tache->suivis()->create([
            'salarie_id' => Auth::id(),
            'type_action' => 'finalisation',
            'commentaire' => 'Tâche marquée comme terminée',
            'date_action' => now(),
        ]);
    }

    // 🔹 Recalculer l’avancement du dossier
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

    public function supprimerDocument($documentId)
{
    $document = DocumentDossier::findOrFail($documentId);
    
    if ($document->uploaded_by !== Auth::id()) {
        return back()->withErrors(['error' => 'Vous n\'êtes pas autorisé à supprimer ce fichier']);
    }
    
    $tache = TacheDossier::find($document->tache_dossier_id);
    if ($tache && in_array($tache->statut, ['terminee', 'validee'])) {
        return back()->withErrors(['error' => 'Impossible de supprimer un fichier d\'une tâche terminée']);
    }
    
    if (Storage::disk('public')->exists($document->chemin_fichier)) {
        Storage::disk('public')->delete($document->chemin_fichier);
    }
    
    if ($tache) {
        HistoriqueMarche::enregistrer(
            marcheId: $tache->dossier->marche_id,
            typeEvenement: 'suppression_fichier',
            description: "Fichier '{$document->nom_original}' supprimé de la tâche '{$tache->nom_tache}'",
            dossierId: $tache->dossier_marche_id,
            tacheId: $tache->id,
            donneesSupp: [
                'nom_fichier' => $document->nom_original,
            ]
        );
    }
    
    $document->delete();
    
    return back()->with('success', 'Fichier supprimé avec succès');
}

}