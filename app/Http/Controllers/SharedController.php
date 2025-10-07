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
use Spatie\Permission\Models\Role;
use App\Notifications\TachePreparationNotification;
use App\Models\DocumentDossier;
use App\Models\HistoriqueMarche;
use App\Models\ParticipationMarche;


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
    $idM=$marche->id;
    // dd($idM);
    $marche->update([
        'is_accepted' => false,
        'etat' => 'en selection', 
        'etape' => 'decision initial',
    ]);

   $data= HistoriqueMarche::enregistrer(
    marcheId: $marche->id,
    typeEvenement: 'selection_marche',
    description: "Marché sélectionné pour analyse",
    commentaire: "État changé: null → en selection"
);
// dd($data);

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

        $dossierFinancier = DossierMarche::create([
            'marche_id' => $marche->id,
            'type_dossier' => 'financier',
            'nom_dossier' => 'Offre Financière',
            'description' => 'Dossier d\'offre financière pour le marché ' . $marche->reference,
            'statut' => 'en_cours',
            'date_creation' => now(),
            'date_limite' => $marche->date_limite_soumission,
        ]);

        $fichiersChemins = [];
        $tachesCreees = 0;
        
        if ($request->hasFile('offre_financiere')) {
            foreach ($request->file('offre_financiere') as $file) {
                $extension = strtolower($file->getClientOriginalExtension());
                
                if (in_array($extension, ['zip', 'rar'])) {
                    $tachesCreees += $this->traiterFichierArchive($file, $dossierFinancier, $marche->id, $fichiersChemins);
                } 
                else {
                    $tachesCreees += $this->traiterFichierSimple($file, $dossierFinancier, $marche->id, $fichiersChemins);
                }
            }
        }

        // Au lieu de stocker en JSON, créer des entrées DocumentDossier
foreach ($fichiersChemins as $fichierData) {
    DocumentDossier::create([
        'dossier_marche_id' => $dossierFinancier->id,
        'tache_dossier_id' => null, // Pas encore affecté à une tâche
        'type_attachment' => 'fichier_specifique',
        'nom_fichier' => $fichierData['nom_fichier'],
        'nom_original' => $fichierData['nom_original'],
        'chemin_fichier' => $fichierData['chemin'],
        'type_mime' => $fichierData['type'],
        'taille_fichier' => $fichierData['taille'],
        'uploaded_by' => Auth::id(),
        'date_upload' => now()
    ]);
}

// Enregistrer dans l'historique
HistoriqueMarche::enregistrer(
    marcheId: $marche->id,
    typeEvenement: 'acceptation_marche',
    description: "Marché accepté avec importance: {$request->importance}",
    dossierId: $dossierFinancier->id,
    commentaire: "Fichiers financiers uploadés",
    donneesSupp: [
        'importance' => $request->importance,
        'nb_fichiers' => count($fichiersChemins)
    ]
);

        // Mettre à jour chemin_fichiers du marché
        $existingFiles = $marche->chemin_fichiers ?? [];
        $newFiles = array_column($fichiersChemins, 'chemin');
        $marche->update([
            'chemin_fichiers' => json_encode(array_merge($existingFiles, $newFiles))
        ]);

        // Recalculer l'avancement
        $dossierFinancier->refresh();
        $dossierFinancier->calculerAvancement();

        // Notifications admins
        try {
            $adminRole = Role::where('name', 'admin')->first();
            if ($adminRole) {
                $admins = $adminRole->users; // ✅ Récupérer les utilisateurs
                
                foreach ($admins as $admin) {
                    $admin->notify(new \App\Notifications\MarcheValidationAdminNotification(
                        $marche,
                        "Service Marketing" 
                    ));
                }
                
                \Log::info("Notifications envoyées à " . $admins->count() . " admins");
            } else {
                \Log::warning("Rôle 'admin' introuvable");
            }
        } catch (Exception $notificationError) {
            \Log::error('Erreur notification: ' . $notificationError->getMessage());
        }

        DB::commit();

        return redirect()->back()->with('success', 
            "Marché accepté avec succès ! {$tachesCreees} tâche(s) créée(s) automatiquement depuis vos fichiers."
        );

    } catch (Exception $e) {
        DB::rollback();
        
        // Nettoyer les fichiers en cas d'erreur
        if (!empty($fichiersChemins)) {
            foreach ($fichiersChemins as $fichier) {
                Storage::disk('public')->delete($fichier['chemin']);
            }
        }
        
        return redirect()->back()->with('error', 'Erreur lors de l\'acceptation: ' . $e->getMessage());
    }
}

/**
 * Traiter un fichier archive (ZIP/RAR)
 */
private function traiterFichierArchive($file, $dossierFinancier, $marcheId, &$fichiersChemins)
{
    $tachesCreees = 0;
    $extension = strtolower($file->getClientOriginalExtension());
    
    // Stocker temporairement l'archive
    $archivePath = $file->store('temp', 'public');
    $fullArchivePath = storage_path('app/public/' . $archivePath);
    $extractPath = storage_path('app/public/temp/extract_' . time() . '_' . Str::random(8));
    
    // Créer le dossier d'extraction
    if (!file_exists($extractPath)) {
        mkdir($extractPath, 0755, true);
    }

    try {
        if ($extension === 'zip') {
            // Extraction ZIP
            $zip = new \ZipArchive();
            if ($zip->open($fullArchivePath) === true) {
                $zip->extractTo($extractPath);
                $zip->close();
            } else {
                throw new \Exception('Impossible d\'ouvrir le fichier ZIP');
            }
        } 
        elseif ($extension === 'rar') {
            // Extraction RAR (nécessite l'extension PHP rar)
            if (!extension_loaded('rar')) {
                // Si l'extension RAR n'est pas disponible, traiter comme fichier simple
                return $this->traiterFichierSimple($file, $dossierFinancier, $marcheId, $fichiersChemins);
            }
            
            $rar = \RarArchive::open($fullArchivePath);
            if ($rar) {
                $entries = $rar->getEntries();
                foreach ($entries as $entry) {
                    $entry->extract($extractPath);
                }
                $rar->close();
            }
        }

        // Scanner tous les fichiers extraits
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($extractPath, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        $ordre = 1;
        foreach ($files as $extractedFile) {
            if (!$extractedFile->isFile()) continue;
            
            $nomFichier = $extractedFile->getFilename();
            
            // Ignorer les fichiers système et cachés
            if (strpos($nomFichier, '.') === 0 || 
                strpos($nomFichier, '__MACOSX') !== false ||
                strpos($nomFichier, 'Thumbs.db') !== false) {
                continue;
            }

            // Déplacer vers le dossier final
            $finalFileName = time() . '_' . $ordre . '_' . Str::slug(pathinfo($nomFichier, PATHINFO_FILENAME)) . '.' . pathinfo($nomFichier, PATHINFO_EXTENSION);
            $finalPath = 'offres_financieres/' . $marcheId . '/' . $finalFileName;
            
            Storage::disk('public')->put($finalPath, file_get_contents($extractedFile->getRealPath()));

            $fichiersChemins[] = [
                'nom_original' => $nomFichier,
                'nom_fichier' => $finalFileName,
                'chemin' => $finalPath,
                'taille' => $extractedFile->getSize(),
                'type' => mime_content_type($extractedFile->getRealPath()),
                'date_upload' => now()->toISOString(),
                'uploaded_by' => Auth::id()
            ];

            // Créer une tâche pour ce fichier
            $nomTache = pathinfo($nomFichier, PATHINFO_FILENAME);
            
            TacheDossier::create([
                'dossier_marche_id' => $dossierFinancier->id,
                'nom_tache' => $nomTache,
                'statut' => 'terminee',
                'priorite' => 'moyenne',
                'ordre' => $ordre,
                'date_debut' => now(),
                'date_fin' => now(),
                'fichiers_produits' => [$finalPath]
            ]);

            $tachesCreees++;
            $ordre++;
        }

        // Nettoyer les fichiers temporaires
        if (file_exists($extractPath)) {
            $this->deleteDirectory($extractPath);
        }
        Storage::disk('public')->delete($archivePath);

    } catch (\Exception $e) {
        // En cas d'erreur, nettoyer et traiter comme fichier simple
        Log::error('Erreur extraction archive: ' . $e->getMessage());
        
        if (file_exists($extractPath)) {
            $this->deleteDirectory($extractPath);
        }
        Storage::disk('public')->delete($archivePath);
        
        return $this->traiterFichierSimple($file, $dossierFinancier, $marcheId, $fichiersChemins);
    }

    return $tachesCreees;
}


private function traiterFichierSimple($file, $dossierFinancier, $marcheId, &$fichiersChemins)
{
    $nomOriginal = $file->getClientOriginalName();
    $nomFichier = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
    
    $path = $file->storeAs('offres_financieres/' . $marcheId, $nomFichier, 'public');
    
    $fichiersChemins[] = [
        'nom_original' => $nomOriginal,
        'nom_fichier' => $nomFichier,
        'chemin' => $path,
        'taille' => $file->getSize(),
        'type' => $file->getMimeType(),
        'date_upload' => now()->toISOString(),
        'uploaded_by' => Auth::id()
    ];
    
    // Créer une tâche avec le nom du fichier
    $nomTache = pathinfo($nomOriginal, PATHINFO_FILENAME);
    
    TacheDossier::create([
        'dossier_marche_id' => $dossierFinancier->id,
        'nom_tache' => $nomTache,
        'statut' => 'terminee',
        'priorite' => 'moyenne',
        'ordre' => 1,
        'date_debut' => now(),
        'date_fin' => now(),
        'fichiers_produits' => [$path]
    ]);
    
    return 1;
}

/**
 * Supprimer un répertoire récursivement
 */
private function deleteDirectory($dir)
{
    if (!file_exists($dir)) return;
    
    $files = array_diff(scandir($dir), ['.', '..']);
    foreach ($files as $file) {
        $path = $dir . '/' . $file;
        is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
    }
    rmdir($dir);
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
        // APRÈS le update, AJOUTER :
        HistoriqueMarche::enregistrer(
            marcheId: $marche->id,
            typeEvenement: 'annulation_marche',
            description: "Marché annulé par " . auth()->user()->name,
            commentaire: $request->motif_annulation
        );

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
    $marcheP = MarchePublic::with(['dossiers' => function($query) {
        $query->where('type_dossier', 'financier')
              ->select('id', 'marche_id', 'statut', 'type_dossier');
    }])
    ->where('etat', 'en cours')
    ->where('is_accepted', true)
    ->whereIn('etape', ['decision admin', 'preparation', 'pret_soumission'])
    ->get()
    ->map(function($marche) {
        $dossierFinancier = $marche->dossiers->firstWhere('type_dossier', 'financier');
        
        $marche->a_modification_requise = false;
        if ($dossierFinancier && 
            $dossierFinancier->statut === 'modification_requis' && 
            $marche->etape === 'preparation') {
            $marche->a_modification_requise = true;
        }
        
        unset($marche->dossiers);
        
        return $marche;
    });
            
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

    $typesRequis = ['administratif', 'technique', 'offre_technique', 'financier'];
    $typesExistants = $marche->dossiers->pluck('type_dossier')->toArray();
    $typesManquants = array_diff($typesRequis, $typesExistants);

    if (!empty($typesManquants)) {
        $this->creerDossiersManquants($marche, $typesManquants);
        $marche->refresh();
    }

    foreach ($marche->dossiers as $dossier) {
        if ($dossier->taches->isEmpty()) {
            $this->creerTachesParDefaut($dossier);
        }
    }

    foreach ($marche->dossiers as $dossier) {
        $dossier->calculerAvancement();
    }

    $marche->refresh()->load('dossiers.taches.affectations.salarie');

    $salariesMarkeeting = Salarie::where('nom_profil', 'marche_marketing')
        ->where('statut', 'actif')
        ->where('is_accepted', true)
        ->select('id', 'nom', 'prenom', 'email', 'poste')
        ->get();

    // Vérifier si le dossier financier a des modifications requises
    $dossierFinancier = $marche->dossiers->firstWhere('type_dossier', 'financier');
    $modificationRequise = null;
    
    if ($dossierFinancier && 
    $marche->etape === 'preparation' && 
    $dossierFinancier->statut === 'modification_requis') {
        $modificationRequise = [
            'dossier_id' => $dossierFinancier->id,
            'type_dossier' => $dossierFinancier->type_dossier,
            'nom_dossier' => $dossierFinancier->nom_dossier,
            'commentaires' => $dossierFinancier->commentaires,
            'statut' => $dossierFinancier->statut
        ];
        // dd($modificationRequise);
    }

    return Inertia::render('marches-marketing/GestionDossiers', [
        'marche' => $marche,
        'salaries' => $salariesMarkeeting,
        'modificationRequise' => $modificationRequise,
    ]);
}

public function creerDossier(Request $request, $marcheId)
    {
        $validated = $request->validate([
            'type_dossier' => 'required|in:administratif,technique,offre_technique,financier',
            'nom_dossier' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_limite' => 'nullable|date'
        ]);

        $marche = MarchePublic::findOrFail($marcheId);

        $dossier = DossierMarche::create([
            'marche_id' => $marcheId,
            'type_dossier' => $validated['type_dossier'],
            'nom_dossier' => $validated['nom_dossier'],
            'description' => $validated['description'] ?? null,
            'statut' => 'en_attente',
            'pourcentage_avancement' => 0,
            'date_limite' => $validated['date_limite'] ?? $marche->date_limite_soumission,
            'date_creation' => now()
        ]);

        // Créer les tâches par défaut selon le type
        $this->creerTachesParDefaut($dossier);

        return back()->with('success', 'Dossier créé avec succès');
    }

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


private function creerTachesParDefaut($dossier)
{
    $tachesConfig = [
        'administratif' => [
            ['nom' => 'Délégation des pouvoirs'],
            ['nom' => 'Statuts de l\'entreprise'],
            ['nom' => 'Déclaration sur l\'honneur'],
            ['nom' => 'Caution provisoire']
        ],
        'technique' => [
            ['nom' => 'Déclaration du plan de charge'],
            ['nom' => 'Agrément'],
            ['nom' => 'Attestations de références techniques'],
            ['nom' => 'Note sur les moyens humains et techniques'],
            ['nom' => 'Attestation de chiffre d\'affaires']
        ],
        'offre_technique' => [
            ['nom' => 'Méthodologie, planning, chronogramme'],
            ['nom' => 'Attestations de références'],
            ['nom' => 'Tableau de l\'équipe projet'],
            ['nom' => 'Diplômes et CVs des membres'],
            ['nom' => 'Attestation ASD CNSS,'],
            ['nom' => 'Historique CNSS'],
            ['nom' => 'BD CNSS'],
            ['nom' => 'Contrats et attestations de travail'],
            ['nom' => 'Déclarations (disponibilité, exclusivité)'],
            ['nom' => 'Conventions avec sous-traitants spécialisés']
        ],
        'financier' => [
            ['nom' => 'Acte d\'engagement'],
            ['nom' => 'Bordereau des prix global'],
            ['nom' => 'Détail estimatif (BPU)']
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
        ]);
    }
}
    public function creerTache(Request $request, $dossierId)
{
    $validated = $request->validate([
        'nom_tache' => 'required|string|max:255',
        'description' => 'nullable|string',
        'priorite' => 'required|in:faible,moyenne,elevee',
        'date_limite' => 'nullable|date',
        'duree_estimee' => 'nullable|numeric|min:0|max:999.99' // ✅ Nouveau champ
    ]);

    $dossier = DossierMarche::findOrFail($dossierId);

    TacheDossier::create([
        'dossier_marche_id' => $dossierId,
        'nom_tache' => $validated['nom_tache'],
        'description' => $validated['description'] ?? null,
        'priorite' => $validated['priorite'],
        'statut' => 'en_attente',
        'date_limite' => $validated['date_limite'] ?? null,
        'duree_estimee' => $validated['duree_estimee'] ?? null, // ✅ Stocke en heures
        'ordre' => $dossier->taches()->count() + 1
    ]);

    $dossier->refresh();
    $dossier->calculerAvancement();

    return back()->with('success', 'Tâche créée avec succès');
}
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
            'statut' => 'en_cours'
        ]);

        $dossier = DossierMarche::find($tache->dossier_marche_id);
        $dossier->refresh();
        $dossier->calculerAvancement();

        return back()->with('success', 'Fichier(s) téléchargé(s) avec succès');
    }

    public function remplacerFichierTache(Request $request, $tacheId)
{
    try {
        $request->validate([
            'fichiers' => 'required|array|min:1',
            'fichiers.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,zip'
        ]);

        $tache = TacheDossier::findOrFail($tacheId);
        $dossier = $tache->dossier;

        // Vérifier que le dossier est en modification_requis
        if ($dossier->statut !== 'modification_requis') {
            return redirect()->back()->withErrors(['error' => 'Ce dossier n\'est pas en mode modification.']);
        }

        // Supprimer les anciens fichiers du stockage
        if ($tache->fichiers_produits) {
            foreach ($tache->fichiers_produits as $ancienFichier) {
                Storage::disk('public')->delete($ancienFichier);
            }
        }

        // Uploader les nouveaux fichiers
        $nouveauxFichiers = [];
        foreach ($request->file('fichiers') as $fichier) {
            $nomFichier = time() . '_' . Str::random(10) . '.' . $fichier->getClientOriginalExtension();
            $path = $fichier->storeAs("marches/taches/{$tacheId}", $nomFichier, 'public');
            $nouveauxFichiers[] = $path;
        }

        // Marquer la tâche comme terminée avec les nouveaux fichiers
        $tache->update([
            'fichiers_produits' => $nouveauxFichiers,
            'statut' => 'terminee'
        ]);

        // ✅ Recalculer avec le flag forceTermine = true
        $dossier->refresh();
        $dossier->calculerAvancement(true); // ← Passer true pour forcer la vérification
        DocumentDossier::where('tache_dossier_id', $tacheId)->delete();

        // ✅ Créer les nouveaux
        foreach ($request->file('fichiers') as $fichier) {
            $nomFichier = time() . '_' . Str::random(10) . '.' . $fichier->getClientOriginalExtension();
            $path = $fichier->storeAs("marches/taches/{$tacheId}", $nomFichier, 'public');
            
            DocumentDossier::create([
                'dossier_marche_id' => $dossier->id,
                'tache_dossier_id' => $tacheId,
                'type_attachment' => 'fichier_specifique',
                'nom_fichier' => $nomFichier,
                'nom_original' => $fichier->getClientOriginalName(),
                'chemin_fichier' => $path,
                'type_mime' => $fichier->getMimeType(),
                'taille_fichier' => $fichier->getSize(),
                'uploaded_by' => Auth::id(),
                'date_upload' => now()
            ]);
        }

        // ✅ Tracer le remplacement
        HistoriqueMarche::enregistrer(
            marcheId: $dossier->marche_id,
            typeEvenement: 'remplacement_fichier',
            description: "Fichiers remplacés suite à demande de modification DG",
            dossierId: $dossier->id,
            tacheId: $tacheId,
            commentaire: $dossier->commentaires
        );
        return redirect()->back()->with('success', 'Fichier(s) remplacé(s) avec succès');

    } catch (\Exception $e) {
        return redirect()->back()->withErrors(['error' => 'Erreur lors du remplacement : ' . $e->getMessage()]);
    }
}

public function affecterTache(Request $request, $tacheId)
{
    $validated = $request->validate([
        'salarie_id' => 'required|exists:salaries,id',
        'role_affectation' => 'nullable|string',
        'date_limite_assignee' => 'nullable|date|after_or_equal:today'
    ]);

    $tache = TacheDossier::findOrFail($tacheId);

    // Vérifier si le salarié est déjà affecté activement
    $existant = AffectationTache::where('tache_dossier_id', $tacheId)
        ->where('salarie_id', $validated['salarie_id'])
        ->where('statut_affectation', 'active')
        ->first();

    if ($existant) {
        return back()->with('error', 'Ce salarié est déjà affecté à cette tâche');
    }

    AffectationTache::create([
        'tache_dossier_id'   => $tacheId,
        'salarie_id'         => $validated['salarie_id'],
        'role_affectation'   => $validated['role_affectation'] ?? 'collaborateur',
        'date_affectation'   => now(),
        'date_limite_assignee' => $validated['date_limite_assignee'] ?? null,
        'statut_affectation' => 'active'
    ]);
    // Après la création de l'affectation, enregistrer la participation
    if ($tache->statut === 'en_attente') {
        $tache->update([
            'statut'     => 'en_cours',
            'date_debut' => now()
        ]);
    }

    // CORRECTION 1 : Utiliser find() au lieu de where()
    $salarie = Salarie::find($validated['salarie_id']);
    
    if ($salarie) {
        // Récupérer le projet
        $dossier = DossierMarche::find($tache->dossier_marche_id);
        $nomProjet = $dossier ? ($dossier->titre ?? $dossier->nom ?? null) : null;
        
        // Déterminer la priorité
        $priorite = 'normal';
        if ($validated['date_limite_assignee']) {
            $days = \Carbon\Carbon::now()->diffInDays(
                \Carbon\Carbon::parse($validated['date_limite_assignee']), 
                false
            );
            if ($days <= 1) $priorite = 'critique';
            elseif ($days <= 3) $priorite = 'urgent';
        }
        
        // CORRECTION 2 : Passer les paramètres à la notification
        $salarie->notify(new TachePreparationNotification(
            $tache,
            $nomProjet,
            $validated['date_limite_assignee'],
            $priorite
        ));
    }

    $dossier = DossierMarche::find($tache->dossier_marche_id);
    if ($dossier) {
        $dossier->refresh();
        $dossier->calculerAvancement();
    }
    $participation = ParticipationMarche::firstOrCreate(
    [
        'marche_id' => $dossier->marche_id,
        'salarie_id' => $validated['salarie_id']
    ],
    [
        'role_global' => 'contributeur',
        'date_debut_participation' => now(),
        'participation_active' => true
    ]
);

    // Incrémenter le compteur de tâches
    $participation->increment('nb_taches_affectees');

    // Enregistrer dans l'historique
    HistoriqueMarche::enregistrer(
        marcheId: $dossier->marche_id,
        typeEvenement: 'affectation_tache',
        description: "Tâche '{$tache->nom_tache}' affectée à {$salarie->prenom} {$salarie->nom}",
        dossierId: $dossier->id,
        tacheId: $tache->id,
        donneesSupp: [
            'salarie_id' => $salarie->id,
            'role' => $validated['role_affectation']
        ]
    );


    return back()->with('success', 'Tâche affectée avec succès');
}

    public function supprimerAffectation($affectationId)
    {
        $affectation = AffectationTache::findOrFail($affectationId);
        $tache = $affectation->tache;
        
        $affectation->delete();
        
        $affectationsRestantes = $tache->affectations()
            ->where('statut_affectation', 'active')
            ->count();
        
        if ($affectationsRestantes === 0) {
            $tache->update([
                'statut' => 'en_attente',
                'date_debut' => null
            ]);
        }

        $dossier = DossierMarche::find($tache->dossier_marche_id);
        $dossier->refresh();
        $dossier->calculerAvancement();
        
        return back()->with('success', 'Affectation supprimée');
    }

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
        
        $dossier = DossierMarche::find($tache->dossier_marche_id);
        $dossier->refresh();
        $dossier->calculerAvancement();
        
        return back()->with('success', 'Statut mis à jour');
    }

    public function supprimerTache($tacheId)
    {
        $tache = TacheDossier::findOrFail($tacheId);
        $dossier = $tache->dossier;
        
        if ($tache->fichiers_produits) {
            foreach ($tache->fichiers_produits as $fichier) {
                Storage::disk('public')->delete($fichier);
            }
        }
        
        $tache->delete();
        
        $dossier->refresh();
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

    public function RechercheDocumentation()
    {
        $marches = MarchePublic::where('is_accepted', true)
            ->orderBy('created_at', 'desc')
            ->select('id', 'reference', 'objet', 'etat', 'etape', 'created_at')
            ->get();

        return Inertia::render('shared/documentation/RechercheMarche', [
            'marches' => $marches
        ]);
    }

    public function AfficherRechercheDocumentation($id)
    {
        $marche = MarchePublic::with([
            'dossiers.fichiers.documentPermanent',
            'dossiers.fichiers.uploader',
            'dossiers.taches.affectations.salarie',
            'participants.salarie',
            'historiques' => function($q) {
                $q->orderBy('date_evenement', 'desc')->limit(50);
            }
        ])->findOrFail($id);

        return Inertia::render('shared/documentation/DetailsMarche', [
            'marche' => $marche
        ]);
    }
}

