<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use Inertia\Inertia;
use App\Models\Document;
use App\Models\DossierMarche;
use App\Models\MarchePublic;
use App\Models\GlobalMarche;
use App\Models\Salarie;
use App\Models\TacheDossier;
use App\Models\AffectationTache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Notifications\MarcheDecisionNotification;
use Spatie\Permission\Models\Role;

class SharedController extends Controller
{
   public function documents(): Response
    {
        $documents = Document::where('archived', false)
            ->where('is_complementary', false)
            ->get();

        return Inertia::render('shared/documentation/Documents', [
            'documents' => $documents,
        ]);
    }

    public function storeDocument(Request $request)
{
    $request->validate([
        'type' => 'required|string',
        'file' => 'required|file|mimes:pdf,jpg,png,doc,docx,xlsx',
    ]);

    // Vérifier si un document actif (non archivé) du même type existe déjà
    $exists = Document::where('type', $request->type)
        ->where('archived', false)
        ->where('is_complementary', false)
        ->exists();

    if ($exists) {
        return redirect()->route('documents.index')
            ->with('error', 'Un document de ce type existe déjà. Veuillez l’archiver avant d’en ajouter un nouveau.');
    }

    // Stocker fichier
    $path = $request->file('file')->store('documents', 'public');

    // Déterminer la périodicité en fonction du type
    $fixedPeriodicities = Document::getFixedPeriodicities();
    $periodicite = $fixedPeriodicities[$request->type] ?? 'annuel';

    // Calculer date d’expiration
    $dateExpiration = match (strtolower($periodicite)) {
        'annuel' => now()->addYear(),
        'mensuel' => now()->addMonth(),
        'trimestriel' => now()->addMonths(3),
        'semestriel' => now()->addMonths(6),
        default => null,
    };

    // Créer le document
    Document::create([
        'type' => $request->type,
        'periodicite' => $periodicite,
        'file_path' => $path,
        'date_expiration' => $dateExpiration,
        'user_id' => Auth::id(),
        'is_complementary' => false,
    ]);

    return redirect()->route('documents.index')
        ->with('success', 'Le document ajouté avec succès');
}


    public function DocumentsArchive(): Response
    {
        $archivedDocuments = Document::where('archived', true)
            ->where('is_complementary', false)
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('shared/documentation/DocumentsArchive', [
            'archivedDocuments' => $archivedDocuments,
        ]);
    }

public function renewDocument($id, Request $request)
    {
        $oldDoc = Document::findOrFail($id);
        $oldDoc->archived = true;
        $oldDoc->save();

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx,xlsx',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        Document::create([
            'type' => $oldDoc->type,
            'periodicite' => $oldDoc->periodicite,
            'file_path' => $path,
            'date_expiration' => Document::expirationFor($oldDoc->periodicite),
            'user_id' => Auth::id(),
            'is_complementary' => false,
        ]);

        return back()->with('success', "Document {$oldDoc->type} renouvelé avec succès");

    }

public function renewComplementary($id, Request $request)
    {
        $oldDoc = Document::findOrFail($id);

        $oldDoc->archived = true;
        $oldDoc->save();

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx,xlsx',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        Document::create([
            'type' => $oldDoc->type,
            'periodicite' => $oldDoc->periodicite,
            'file_path' => $path,
            'date_expiration' => Document::expirationFor($oldDoc->periodicite),
            'user_id' => Auth::id(),
            'is_complementary' => true,
        ]);

        return back()->with('success', 'Document complémentaire renouvelé');
    }

public function complementaryDocuments(): Response
    {
        $docs = Document::where('archived', false)
            ->where('is_complementary', true)
            ->get();

        return Inertia::render('shared/documentation/DocumentsComplementaires', [
            'documents' => $docs,
        ]);
    }

    public function storeComplementary(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'periodicite' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,png,doc,docx,xlsx',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        Document::create([
            'type' => $request->type,
            'periodicite' => $request->periodicite,
            'file_path' => $path,
            'date_expiration' => Document::expirationFor($request->periodicite),
            'user_id' => Auth::id(),
            'is_complementary' => true,
        ]);

        return redirect()->route('documents.complementaires.index')->with('success', 'Document complémentaire ajouté avec succès');
    }

    public function archivedComplementaryDocuments(): Response
    {
        $archivedDocuments = Document::where('archived', true)
            ->where('is_complementary', true)
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('shared/documentation/ArchiveDocumentsComplementaires', [
            'archivedDocuments' => $archivedDocuments,
        ]);
    }


// -----------------------------------{ - MARCHES - }--------------------------------



public function marchesPublic(){

    $marchePublics = MarchePublic::where('is_accepted', false)
    ->where(function($query) {
        $query->where('etat', '!=', 'rejetee')
              ->orWhereNull('etat');
    })
    ->get();

    return Inertia::render('shared/marches/MarchesPublics', [
        'marchePublics' => $marchePublics,
    ]);

}
public function GlobalMarches(){

    $globalMarches = GlobalMarche::where('is_accepted', false)
    ->where(function($query) {
        $query->where('etat', '!=', 'rejetee')
              ->orWhereNull('etat');
    })
    ->get();

    return Inertia::render('shared/marches/MarchesGlobal', [
        'globalMarches' => $globalMarches,
    ]);

}



public function selectMP($id, Request $request)
{
    $marche = MarchePublic::findOrFail($id);

    $marche->update([
        'is_accepted' => false,
        'etat' => 'en selection', 
        'etape' => 'decision initial',
    ]);

    return redirect()->back()->with('success', 'Le marché a été selectioné avec succès');
}


public function acceptMP($id, Request $request)
{
    $marche = MarchePublic::findOrFail($id);

    $request->validate([
        'importance' => 'required|in:ao_ouvert,ao_important,ao_simplifie,ao_restreint,ao_preselection,ao_bon_commande',
    ], [
        'importance.required' => 'Le type d\'AO est obligatoire.',
        'importance.in' => 'Le type d\'AO sélectionné n\'est pas valide.',
    ]);

    $marche->update([
        'is_accepted' => true,
        'etat' => 'en cours', 
        'etape' => 'decision initial',
        'importance' => $request->importance,
    ]);

    return redirect()->back()->with('success', 'Le marché a été accepté avec succès');
}


    public function rejectMP($id)
{
    $marche = MarchePublic::findOrFail($id);

    $marche->update([
        'is_accepted' => false,
        'etat'        => 'rejetee',
        'etape'       => null, 
    ]);

    return redirect()->back()->with('success', 'Le marché a été rejeté ❌');
}



public function acceptIMP(Request $request, $id) 
{
    $request->validate([
        'importance' => 'required|in:ao_ouvert,ao_important,ao_simplifie,ao_restreint,ao_preselection,ao_bon_commande',
        'offre_financiere.*' => 'required|file|mimes:pdf,zip,rar|max:10240',
    ]);

    DB::beginTransaction();

    try {
        $marche = MarchePublic::findOrFail($id);

        $marche->update([
            'importance' => $request->importance,
            'etape' => 'decision admin',
            'etat' => 'en cours',
            'is_accepted' => true,
            'statut' => 'en_preparation'
        ]);

        // Gérer les fichiers d'offre financière
        $fichiersChemins = [];
        
        if ($request->hasFile('offre_financiere')) {
            foreach ($request->file('offre_financiere') as $index => $file) {
                $originalName = $file->getClientOriginalName();
                $fileName = time() . '_' . $index . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                
                $path = $file->storeAs(
                    'offres_financieres/' . $marche->id, 
                    $fileName, 
                    'public'
                );
                
                $fichiersChemins[] = [
                    'nom_original' => $originalName,
                    'nom_fichier' => $fileName,
                    'chemin' => $path,
                    'taille' => $file->getSize(),
                    'type' => $file->getMimeType(),
                    'date_upload' => now()->toISOString(),
                    'uploaded_by' => Auth::user()->id
                ];
            }
        }

        // ✅ CORRECTION : Créer le dossier financier avec les fichiers ET les tâches par défaut
        $dossierFinancier = DossierMarche::create([
            'marche_id' => $marche->id,
            'type_dossier' => 'financier',
            'nom_dossier' => 'Offre Financière',
            'description' => 'Dossier d\'offre financière pour le marché ' . $marche->reference,
            'statut' => 'en_cours', // ✅ En cours car des fichiers ont été uploadés
            'pourcentage_avancement' => 0, // ✅ 0 car les tâches ne sont pas encore créées
            'date_creation' => now(),
            'date_limite' => $marche->date_limite_soumission,
            'fichiers_joints' => json_encode($fichiersChemins),
            'commentaires' => 'Offre financière soumise par ' . Auth::user()->name
        ]);

        // ✅ Créer immédiatement les tâches du dossier financier
        $tachesFinancieres = [
            ['nom' => 'Acte d\'engagement', 'duree' => 2],
            ['nom' => 'Bordereau des prix global', 'duree' => 8],
            ['nom' => 'Détail estimatif (BPU)', 'duree' => 12]
        ];

        foreach ($tachesFinancieres as $index => $tacheData) {
            TacheDossier::create([
                'dossier_marche_id' => $dossierFinancier->id,
                'nom_tache' => $tacheData['nom'],
                'priorite' => 'moyenne',
                'statut' => 'en_attente',
                'ordre' => $index + 1,
                'duree_estimee' => $tacheData['duree']
            ]);
        }

        // Mettre à jour chemin_fichiers du marché
        $existingFiles = $marche->chemin_fichiers ? json_decode($marche->chemin_fichiers, true) : [];
        $newFiles = array_column($fichiersChemins, 'chemin');
        $allFiles = array_merge($existingFiles, $newFiles);
        
        $marche->update([
            'chemin_fichiers' => json_encode($allFiles)
        ]);

        // Notifications admins
        try {
            $adminRole = Role::where('name', 'admin')->first();
            
            if ($adminRole) {
                $admins = $adminRole->users;
                
                foreach ($admins as $admin) {
                    $admin->notify(new MarcheDecisionNotification($marche, Auth::user(), $admin->id));
                }
            }
        } catch (Exception $notificationError) {
            Log::error('Erreur notification: ' . $notificationError->getMessage());
        }

        DB::commit();

        return redirect()->back()->with('success', 
            'Marché accepté avec succès ! Votre offre financière (' . count($fichiersChemins) . ' fichier(s)) a été transmise pour décision administrative.'
        );

    } catch (Exception $e) {
        DB::rollback();
        
        if (!empty($fichiersChemins)) {
            foreach ($fichiersChemins as $fichier) {
                Storage::disk('public')->delete($fichier['chemin']);
            }
        }
        
        return redirect()->back()->with('error', 'Erreur lors de l\'acceptation du marché: ' . $e->getMessage());
    }
}

public function annulerMP(Request $request, $id)
{
    try {
        $request->validate([
            'motif_annulation' => 'required|string|max:500'
        ]);

        $marche = MarchePublic::findOrFail($id);
        
        $marche->update([
            'etat' => 'annulee',
            'motif_annulation' => $request->motif_annulation,
            'date_annulation' => now(),
            'annule_par' => Auth::id()
        ]);

        return redirect()->back()->with('success', 'Marché annulé avec succès');

    } catch (Exception $e) {

        return redirect()->back()->with('error', 'Erreur lors de l\'annulation du marché: ' . $e->getMessage());
    }
}
   
    public function marchesRejetee(){

        $marcheR= MarchePublic::where('etat','rejetee')
    ->where('is_accepted',false)
    ->get();
    
    return Inertia::render('shared/marches/Rejetee', [
        'marcheR' => $marcheR,
    ]);
    }

    public function marchesTerminee(){

        $marcheT= MarchePublic::where('etat','terminee')
    ->where('is_accepted',true)
    ->get();
    
    return Inertia::render('shared/marches/Terminee', [
        'marcheT' => $marcheT,
    ]);
    }



public function aosSelectionnes(){

    $marcheS= MarchePublic::
    where('etat','en selection')
    ->where('etape','decision initial')
    ->where('is_accepted',false)
    ->get();

    return Inertia::render('shared/marches/AosSelectionne', [
        'marcheS' => $marcheS,
    ]);

}


    public function marchesEnCours()
    {
        $marcheP = MarchePublic::where('etat', 'en cours')
            ->where('is_accepted', true)
            ->whereIn('etape', ['decision admin', 'preparation', 'pret_soumission'])
            ->get();
       
        return Inertia::render('shared/marches/EnCours', [
            'marcheP' => $marcheP,
        ]);
    }

public function afficherDossiers($marcheId)
{
    $marche = MarchePublic::with([
        'dossiers' => function($query) {
            $query->with('taches.affectations.salarie');
        }
    ])->findOrFail($marcheId);

    // ✅ Vérifier si les 4 types de dossiers standard existent
    $typesRequis = ['administratif', 'technique', 'offre_technique', 'financier'];
    $typesExistants = $marche->dossiers->pluck('type_dossier')->toArray();
    $typesManquants = array_diff($typesRequis, $typesExistants);

    // Créer uniquement les dossiers manquants
    if (!empty($typesManquants)) {
        $this->creerDossiersManquants($marche, $typesManquants);
        $marche->refresh();
    }

    // ✅ CORRECTION : Créer les tâches UNIQUEMENT pour les dossiers qui n'en ont pas
    foreach ($marche->dossiers as $dossier) {
        if ($dossier->taches->isEmpty()) {
            $this->creerTachesParDefaut($dossier);
        }
    }

    // Recharger avec toutes les relations
    $marche->refresh()->load('dossiers.taches.affectations.salarie');

    $salariesMarkeeting = Salarie::where('nom_profil', 'marche_marketing')
        ->where('statut', 'actif')
        ->select('id', 'nom', 'prenom', 'email', 'poste')
        ->get();

    return Inertia::render('marches-marketing/GestionDossiers', [
        'marche' => $marche,
        'salaries' => $salariesMarkeeting,
    ]);
}

// ✅ Créer seulement les dossiers manquants
private function creerDossiersManquants($marche, $typesManquants)
{
    $dossiersConfig = [
        'administratif' => 'Dossier Administratif',
        'technique' => 'Dossier Technique',
        'offre_technique' => 'Offre Technique',
        'financier' => 'Offre Financière'
    ];

    foreach ($typesManquants as $type) {
        if (isset($dossiersConfig[$type])) {
            DossierMarche::create([
                'marche_id' => $marche->id,
                'type_dossier' => $type,
                'nom_dossier' => $dossiersConfig[$type],
                'statut' => 'en_attente',
                'pourcentage_avancement' => 0,
                'date_limite' => $marche->date_limite_soumission,
                'date_creation' => now()
            ]);
        }
    }
}

// ✅ CORRECTION : Tâches exactes selon votre documentation
private function creerTachesParDefaut($dossier)
{
    $tachesConfig = [
        'administratif' => [
            ['nom' => 'Délégation des pouvoirs', 'duree' => 2],
            ['nom' => 'Statuts de l\'entreprise', 'duree' => 1],
            ['nom' => 'Déclaration sur l\'honneur', 'duree' => 1],
            ['nom' => 'Caution provisoire', 'duree' => 3]
        ],
        'technique' => [
            ['nom' => 'Déclaration du plan de charge', 'duree' => 4],
            ['nom' => 'Agrément', 'duree' => 2],
            ['nom' => 'Attestations de références techniques', 'duree' => 3],
            ['nom' => 'Note sur les moyens humains et techniques', 'duree' => 8],
            ['nom' => 'Attestation de chiffre d\'affaires', 'duree' => 2]
        ],
        'offre_technique' => [
            ['nom' => 'Méthodologie, planning, chronogramme', 'duree' => 16],
            ['nom' => 'Attestations de références', 'duree' => 4],
            ['nom' => 'Tableau de l\'équipe projet', 'duree' => 6],
            ['nom' => 'Diplômes et CVs des membres', 'duree' => 8],
            ['nom' => 'Attestation ASD CNSS, historique CNSS, BD CNSS', 'duree' => 4],
            ['nom' => 'Contrats et attestations de travail', 'duree' => 3],
            ['nom' => 'Déclarations (disponibilité, exclusivité)', 'duree' => 2],
            ['nom' => 'Conventions avec sous-traitants spécialisés', 'duree' => 6]
        ],
        'financier' => [
            ['nom' => 'Acte d\'engagement', 'duree' => 2],
            ['nom' => 'Bordereau des prix global', 'duree' => 8],
            ['nom' => 'Détail estimatif (BPU)', 'duree' => 12]
        ]
    ];

    $taches = $tachesConfig[$dossier->type_dossier] ?? [];
    
    foreach ($taches as $index => $tacheData) {
        TacheDossier::create([
            'dossier_marche_id' => $dossier->id,
            'nom_tache' => $tacheData['nom'],
            'priorite' => 'moyenne',
            'statut' => 'en_attente',
            'ordre' => $index + 1,
            'duree_estimee' => $tacheData['duree']
        ]);
    }
}


    // Créer une nouvelle tâche
    public function creerTache(Request $request, $dossierId)
    {
        $validated = $request->validate([
            'nom_tache' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priorite' => 'required|in:faible,moyenne,elevee',
            'date_limite' => 'nullable|date'
        ]);

        $dossier = DossierMarche::findOrFail($dossierId);

        $tache = TacheDossier::create([
            'dossier_marche_id' => $dossierId,
            'nom_tache' => $validated['nom_tache'],
            'description' => $validated['description'] ?? null,
            'priorite' => $validated['priorite'],
            'statut' => 'en_attente',
            'date_limite' => $validated['date_limite'] ?? null,
            'ordre' => $dossier->taches()->count() + 1
        ]);
         $dossier = DossierMarche::find($tache->dossier_marche_id);
        $dossier->refresh();
        $dossier->calculerAvancement();

        return back()->with('success', 'Tâche créée avec succès');
    }

    // Upload de fichiers pour une tâche
    public function uploadFichiers(Request $request, $tacheId)
    {
        $request->validate([
            'fichiers' => 'required|array',
            'fichiers.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png'
        ]);

        $tache = TacheDossier::findOrFail($tacheId);
        $fichiersProduits = $tache->fichiers_produits ?? [];

        foreach ($request->file('fichiers') as $fichier) {
            $path = $fichier->store("marches/taches/{$tacheId}", 'public');
            $fichiersProduits[] = $path;
        }

        $tache->update([
            'fichiers_produits' => $fichiersProduits,
            'statut' => 'en_cours' // Automatiquement passer en "en_cours" lors de l'upload
        ]);

        // Recalculer l'avancement du dossier
        // $tache->dossier->calculerAvancement();
        $dossier = DossierMarche::find($tache->dossier_marche_id);
        $dossier->refresh();
        $dossier->calculerAvancement();
        return back()->with('success', 'Fichier(s) téléchargé(s) avec succès');
    }

    // Supprimer un fichier
    public function supprimerFichier(Request $request, $tacheId)
    {
        $request->validate([
            'fichier' => 'required|string'
        ]);

        $tache = TacheDossier::findOrFail($tacheId);
        $fichiersProduits = $tache->fichiers_produits ?? [];

        // Supprimer du stockage
        Storage::disk('public')->delete($request->fichier);

        // Retirer du tableau
        $fichiersProduits = array_filter($fichiersProduits, fn($f) => $f !== $request->fichier);

        $tache->update([
            'fichiers_produits' => array_values($fichiersProduits)
        ]);

        return back()->with('success', 'Fichier supprimé');
    }

    // Affecter une tâche à un salarié
    public function affecterTache(Request $request, $tacheId)
{
    $validated = $request->validate([
        'salarie_id' => 'required|exists:salaries,id',
        'role_affectation' => 'nullable|string',
        'duree_assignee' => 'nullable|numeric|min:0.5' // Durée en heures
    ]);

    $tache = TacheDossier::findOrFail($tacheId);

    // Vérifier si déjà affecté
    $existant = AffectationTache::where('tache_dossier_id', $tacheId)
        ->where('salarie_id', $validated['salarie_id'])
        ->where('statut_affectation', 'active')
        ->first();

    if ($existant) {
        return back()->with('error', 'Ce salarié est déjà affecté à cette tâche');
    }

    // Calculer date limite assignée basée sur la durée
    $dateLimiteAssignee = null;
    if (isset($validated['duree_assignee'])) {
        $heures = $validated['duree_assignee'];
        $jours = ceil($heures / 8); // 8h par jour
        $dateLimiteAssignee = now()->addDays($jours);
    } elseif ($tache->duree_estimee) {
        $jours = ceil($tache->duree_estimee / 8);
        $dateLimiteAssignee = now()->addDays($jours);
    }

    AffectationTache::create([
        'tache_dossier_id' => $tacheId,
        'salarie_id' => $validated['salarie_id'],
        'role_affectation' => $validated['role_affectation'] ?? 'collaborateur',
        'date_affectation' => now(),
        'date_limite_assignee' => $dateLimiteAssignee,
        'statut_affectation' => 'active'
    ]);

    // Mettre à jour le statut de la tâche
    if ($tache->statut === 'en_attente') {
        $tache->update([
            'statut' => 'en_cours',
            'date_debut' => now()
        ]);
    }
    $dossier = DossierMarche::find($tache->dossier_marche_id);
    $dossier->refresh();
    $dossier->calculerAvancement();

    return back()->with('success', 'Tâche affectée avec succès');
}

    // Supprimer une affectation
    public function supprimerAffectation($affectationId)
{
    $affectation = AffectationTache::findOrFail($affectationId);
    $tache = $affectation->tache;
    
    $affectation->delete();
    
    // Si plus aucune affectation active, remettre en attente
    $affectationsRestantes = $tache->affectations()
        ->where('statut_affectation', 'active')
        ->count();
    
    if ($affectationsRestantes === 0) {
        $tache->update([
            'statut' => 'en_attente',
            'date_debut' => null
        ]);
    }
    
    return back()->with('success', 'Affectation supprimée');
}

    // Mettre à jour le statut d'une tâche
public function mettreAJourStatutTache(Request $request, $tacheId)
{
    $validated = $request->validate([
        'statut' => 'required|in:en_attente,en_cours,terminee,validee'
    ]);

    $tache = TacheDossier::findOrFail($tacheId);
    
    $updateData = ['statut' => $validated['statut']];
    
    switch ($validated['statut']) {
        case 'en_cours':
            if (!$tache->date_debut) {
                $updateData['date_debut'] = now();
            }
            break;
            
        case 'terminee':
        case 'validee':
            if (!in_array($tache->statut, ['terminee', 'validee'])) {
                $updateData['date_fin'] = now();
            }
            break;
            
        case 'en_attente':
            $updateData['date_debut'] = null;
            $updateData['date_fin'] = null;
            break;
    }
    
    $tache->update($updateData);
    
    // ✅ CRITIQUE : Recharger le dossier et recalculer
    $dossier = DossierMarche::find($tache->dossier_marche_id);
    $dossier->refresh();
    $dossier->calculerAvancement();
    
    return back()->with('success', 'Statut mis à jour');
}

    // Supprimer une tâche
    public function supprimerTache($tacheId)
    {
        $tache = TacheDossier::findOrFail($tacheId);
        $dossier = $tache->dossier;
        
        // Supprimer les fichiers associés
        if ($tache->fichiers_produits) {
            foreach ($tache->fichiers_produits as $fichier) {
                Storage::disk('public')->delete($fichier);
            }
        }
        
        $tache->delete();
        
        // Recalculer l'avancement
        $dossier->calculerAvancement();

        return back()->with('success', 'Tâche supprimée');
    }


public function marchesAnnulee(){

    $marcheA= MarchePublic::where('etat','annulee')
    ->where('is_accepted',true)
    ->get();
    
    return Inertia::render('shared/marches/Annulee', [
        'marcheA' => $marcheA,
    ]);
}

}