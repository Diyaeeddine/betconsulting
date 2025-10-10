<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\DirectionGeneraleController;
use App\Http\Controllers\CommunicationDigitaleController;
use App\Http\Controllers\EtudesTechniquesController;
use App\Http\Controllers\FinancierComptabiliteController;
use App\Http\Controllers\FournisseursTraitantsController;
use App\Http\Controllers\InnovationTransitionController;
use App\Http\Controllers\JuridiqueController;
use App\Http\Controllers\LogistiqueGenerauxController;
use App\Http\Controllers\DebugEntretienController;
use App\Http\Controllers\MarchesMarketingController;
use App\Http\Controllers\QualiteAuditController;
use App\Http\Controllers\RessourcesHumainesController;
use App\Http\Controllers\SuiviControleController;
use App\Http\Controllers\SalarieController;
use App\Http\Controllers\ScreenshotController;
use App\Http\Controllers\BonCommande;
use App\Http\Controllers\Session;   
use App\Http\Controllers\MethodologyDocument;
use App\Http\Controllers\MethodologyDocumentNotification;
use App\Http\Controllers\SharedController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\TracabiliteController;
use App\Http\Controllers\Auth\SalarieAuthController;
use App\Http\Controllers\Auth\UniversalLogoutController;
use App\Http\Controllers\DocumentationRechercheController;
use App\Events\NewNotification;
use App\Models\User;
use App\Models\Salarie;
use App\Models\Document;
use App\Models\MarchePublic;
use App\Notifications\TestNotification;
use App\Notifications\DocumentExpirationNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\DocsRequis;



Route::post('/logout', [UniversalLogoutController::class, 'destroy'])
            ->name('logout');

            // ===== SALARIE AUTHENTICATION ROUTES =====
Route::prefix('salarie')->name('salarie.')->group(function () {
    Route::middleware('guest:salarie')->group(function () {
        Route::get('login', [SalarieAuthController::class, 'showLoginForm'])
            ->name('login');
        Route::post('login', [SalarieAuthController::class, 'login']);


    });
    
    Route::middleware(['auth:salarie'])->group(function () {
        Route::get('profile', [SalarieController::class, 'index'])->name('profile');
        Route::post('conge/demander', [SalarieController::class, 'demanderConge'])->name('conge.demander');
        Route::post('certificat-maladie/demander', [SalarieController::class, 'demanderCertificatMaladie'])->name('certificat.demander');
        
        // Tâches marché pour salariés
        Route::get('/marches/taches', [SalarieController::class, 'mesTachesMarches'])
            ->name('marches.taches');
        Route::get('/marches/taches/dossier/{dossier}', [SalarieController::class, 'showDossier'])
            ->name('marches.dossier');
        Route::post('/marches/taches/{tacheId}/upload', [SalarieController::class, 'uploadFichiersTache'])
            ->name('marches.taches.upload');
        Route::post('/marches/taches/{tacheId}/terminer', [SalarieController::class, 'marquerTacheTerminee'])
            ->name('marches.taches.terminer');
        Route::get('/marches/taches/{tacheId}/telecharger', [SalarieController::class, 'telechargerFichierTache'])
            ->name('marches.taches.telecharger');
        Route::get('/marches/taches/{id}', [SalarieController::class, 'show'])
            ->name('taches.show');
        Route::delete('/marches/documents/{documentId}', [SalarieController::class, 'supprimerDocument'])
            ->name('marches.documents.supprimer');
    });
});

// ===== HOME ROUTE =====
Route::get('/', function () {
    // Check salarie guard first
    if (Auth::guard('salarie')->check()) {
        return redirect()->route('salarie.profile');
    }
    
    // Then check web guard
    $user = Auth::guard('web')->user();

    if (!$user) {
        return redirect()->route('login');
    }

    return match (true) {
        $user->hasRole('admin') => redirect()->route('dashboard.direction-generale'),
        $user->hasRole('marches-marketing') => redirect()->route('dashboard.marches-marketing'),
        $user->hasRole('direction-generale') => redirect()->route('dashboard.direction-generale'),
        $user->hasRole('communication-digitale') => redirect()->route('dashboard.communication-digitale'),
        $user->hasRole('etudes-techniques') => redirect()->route('dashboard.etudes-techniques'),
        $user->hasRole('financier-comptabilite') => redirect()->route('dashboard.financier-comptabilite'),
        $user->hasRole('fournisseurs-traitants') => redirect()->route('dashboard.fournisseurs-traitants'),
        $user->hasRole('innovation-transition') => redirect()->route('dashboard.innovation-transition'),
        $user->hasRole('juridique') => redirect()->route('dashboard.juridique'),
        $user->hasRole('logistique-generaux') => redirect()->route('dashboard.logistique-generaux'),
        $user->hasRole('qualite-audit') => redirect()->route('dashboard.qualite-audit'),
        $user->hasRole('ressources-humaines') => redirect()->route('dashboard.ressources-humaines'),
        $user->hasRole('suivi-controle') => redirect()->route('dashboard.suivi-controle'),
        default => redirect()->route('login'),
    };
})->name('home');

// ===== TEST ROUTES =====
Route::get('/test-notification', function () {
    $user = User::first();
    $user->notify(new TestNotification("Hello, this is a test notification 🚀"));
    return "Notification sent!";
});

Route::get('/test-pusher', function () {
    $user = auth()->user() ?? User::first();
    $document = Document::first();
    
    if (!$document) {
        return response()->json([
            'error' => 'Aucun document trouvé en base de données. Créez d\'abord un document.'
        ]);
    }
    
    if (!$user) {
        return response()->json([
            'error' => 'Aucun utilisateur trouvé. Connectez-vous d\'abord.'
        ]);
    }

    $user->notify(new DocumentExpirationNotification($document, 5));
    $latestNotification = $user->notifications()->latest()->first();
    event(new NewNotification($latestNotification, $user->id));

    return response()->json([
        'success' => true,
        'message' => 'Notification envoyée pour le document: ' . $document->type,
        'user_id' => $user->id,
        'document_id' => $document->id,
        'channel' => 'private-user.' . $user->id
    ]);
});

// ===== DIRECTION GÉNÉRALE (ADMIN) ROUTES =====
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/direction-generale/dashboard', [DirectionGeneraleController::class, 'index'])
        ->name('dashboard.direction-generale');
    
    Route::get('/direction-generale/boite-decision', [DirectionGeneraleController::class, 'boiteDecision'])
        ->name('direction-generale.boiteDecision');
    
    Route::get('/direction-generale/boite-decision-marche', [DirectionGeneraleController::class, 'marcheDecision'])
        ->name('direction-generale.boiteDecision');
    
    Route::get('/direction-generale/boite-decision-profile', [DirectionGeneraleController::class, 'profileDecision'])
        ->name('direction-generale.boiteDecisionProfile');
    
    Route::post('/direction-generale/profile-decision/{salarie}', [DirectionGeneraleController::class, 'handleSalarieDecision'])
        ->name('direction-generale.handleSalarieDecision');
    
    Route::post('/direction-generale/profile-decision/{salarie}', [DirectionGeneraleController::class, 'handleProfileDecision'])
        ->name('direction-generale.handleProfileDecision');
    
    Route::post('/direction-generale/marche/{id}/accepter', [DirectionGeneraleController::class, 'accepterMarche'])
        ->name('direction-generale.accepter-marche');
    
    Route::post('/direction-generale/marche/{id}/approuver-final', [DirectionGeneraleController::class, 'approuverFinal'])
        ->name('direction-generale.approuverFinal');
    
    Route::post('/direction-generale/marche/{id}/demander-modification', [DirectionGeneraleController::class, 'demanderModification'])
        ->name('direction-generale.demanderModification');
    
    Route::post('/direction-generale/marche/{id}/refuser', [DirectionGeneraleController::class, 'refuserMarche'])
        ->name('direction-generale.refuser-marche');

    // Entretiens en attente de validation
    Route::get('direction-generale/entretiens/validation', [DirectionGeneraleController::class, 'entretiensValidation'])
        ->name('direction-generale.entretiens.validation');
    
    Route::post('direction-generale/entretiens/{entretien}/valider', [DirectionGeneraleController::class, 'validerEntretien'])
        ->name('direction-generale.entretiens.valider');
    
    Route::post('direction-generale/entretiens/{entretien}/rejeter', [DirectionGeneraleController::class, 'rejeterEntretien'])
        ->name('direction-generale.entretiens.rejeter');
    
    Route::get('direction-generale/entretiens/{entretien}', [DirectionGeneraleController::class, 'showEntretien'])
        ->name('direction-generale.entretiens.show');
    
    Route::get('direction-generale/entretiens/{entretien}/export', [DirectionGeneraleController::class, 'exportEntretien'])
        ->name('direction-generale.entretiens.export');

    Route::get('direction-generale/entretiens/{entretien}/document/{type}', [DirectionGeneraleController::class, 'downloadDocument'])
        ->name('direction-generale.entretiens.document');
});

// ===== COMMUNICATION DIGITALE ROUTES =====
Route::middleware(['auth', 'verified', 'role:communication-digitale'])->group(function () {
    Route::get('/communication-digitale/dashboard', [CommunicationDigitaleController::class, 'index'])
        ->name('dashboard.communication-digitale');
});

// ===== ÉTUDES TECHNIQUES ROUTES =====
Route::middleware(['auth', 'verified', 'role:etudes-techniques'])->group(function () {
    Route::get('/etudes-techniques/dashboard', [EtudesTechniquesController::class, 'index'])
        ->name('dashboard.etudes-techniques');
});

// ===== FINANCIER & COMPTABILITÉ ROUTES =====
Route::middleware(['auth', 'verified', 'role:financier-comptabilite'])->group(function () {
    Route::get('/financier-comptabilite/dashboard', [FinancierComptabiliteController::class, 'index'])
        ->name('dashboard.financier-comptabilite');
});

// ===== FOURNISSEURS & TRAITANTS ROUTES =====
Route::middleware(['auth', 'verified', 'role:fournisseurs-traitants'])->group(function () {
    Route::get('/fournisseurs-traitants/dashboard', [FournisseursTraitantsController::class, 'index'])
        ->name('dashboard.fournisseurs-traitants');

    // Methodology & Planning
    Route::get('/fournisseurs-traitants/MethodologiePlanning', [FournisseursTraitantsController::class, 'MethodologiePlanning'])
        ->name('MethodologiePlanning.fournisseurs-traitants');
    
    Route::post('/fournisseurs-traitants/methodologie/upload', [FournisseursTraitantsController::class, 'uploadMethodology'])
        ->name('methodologie.upload');
    
    Route::get('/fournisseurs-traitants/methodologie/{document}/download', [FournisseursTraitantsController::class, 'downloadMethodology'])
        ->name('methodologie.download');
    
    Route::delete('/fournisseurs-traitants/methodologie/{document}', [FournisseursTraitantsController::class, 'deleteMethodology'])
        ->name('methodologie.delete');

    // Other Pages
    Route::get('/fournisseurs-traitants/OffreTechnique', [FournisseursTraitantsController::class, 'OffreTechnique'])
        ->name('OffreTechnique.fournisseurs-traitants');
    
    Route::get('/fournisseurs-traitants/AccordsST', [FournisseursTraitantsController::class, 'AccordsST'])
        ->name('AccordsST.fournisseurs-traitants');
    
    Route::get('/fournisseurs-traitants/TeamTable', [FournisseursTraitantsController::class, 'TeamTable'])
        ->name('TeamTable.fournisseurs-traitants');

    // References Routes
    Route::get('/fournisseurs-traitants/references', [FournisseursTraitantsController::class, 'References'])
        ->name('references.index');
    
    Route::post('/fournisseurs-traitants/references/store', [FournisseursTraitantsController::class, 'storeReference'])
        ->name('references.store');
    
    Route::get('/fournisseurs-traitants/references/{id}', [FournisseursTraitantsController::class, 'showReference'])
        ->name('references.show');
    
    Route::put('/fournisseurs-traitants/references/{id}', [FournisseursTraitantsController::class, 'updateReference'])
        ->name('references.update');
    
    Route::delete('/fournisseurs-traitants/references/{id}', [FournisseursTraitantsController::class, 'deleteReference'])
        ->name('references.destroy');
    
    Route::get('/fournisseurs-traitants/references/{id}/download', [FournisseursTraitantsController::class, 'downloadReferenceDocument'])
        ->name('references.download');

    // Grouped references routes
    Route::prefix('fournisseurs-traitants')->group(function () {
        Route::get('/references', [FournisseursTraitantsController::class, 'References'])
            ->name('fournisseurs-traitants.references');
        
        Route::post('/references/store', [FournisseursTraitantsController::class, 'storeReference'])
            ->name('fournisseurs-traitants.references.store');
        
        Route::delete('/references/{id}', [FournisseursTraitantsController::class, 'deleteReference'])
            ->name('fournisseurs-traitants.references.destroy');
    });

    Route::get('/fournisseurs-traitants/CNSSDocuments', [FournisseursTraitantsController::class, 'CNSSDocuments'])
        ->name('CNSSDocuments.fournisseurs-traitants');
});

// ===== INNOVATION & TRANSITION ROUTES =====
Route::middleware(['auth', 'verified', 'role:innovation-transition'])->group(function () {
    Route::get('/innovation-transition/dashboard', [InnovationTransitionController::class, 'index'])
        ->name('dashboard.innovation-transition');
});

// ===== JURIDIQUE ROUTES =====
Route::middleware(['auth', 'verified', 'role:juridique'])->group(function () {
    Route::get('/juridique/dashboard', [JuridiqueController::class, 'index'])
        ->name('dashboard.juridique');
});

// ===== LOGISTIQUE & GÉNÉRAUX ROUTES =====
Route::middleware(['auth', 'verified', 'role:logistique-generaux'])->group(function () {
    Route::get('/logistique-generaux/dashboard', [LogistiqueGenerauxController::class, 'index'])
        ->name('dashboard.logistique-generaux');
    
    // Documents routes
    Route::get('/logistique-generaux/documents', [LogistiqueGenerauxController::class, 'documents'])
        ->name('logistique-generaux.documents');
    Route::post('/logistique-generaux/documents', [LogistiqueGenerauxController::class, 'storeDocument'])
        ->name('logistique-generaux.documents.store');
    Route::post('/logistique-generaux/documents/{id}/renew', [LogistiqueGenerauxController::class, 'renewDocument'])
        ->name('logistique-generaux.documents.renew');
    Route::delete('/logistique-generaux/documents/{id}', [LogistiqueGenerauxController::class, 'deleteDocument'])
        ->name('logistique-generaux.documents.delete');
    
    Route::get('/logistique-generaux/documents/archives', [LogistiqueGenerauxController::class, 'documentsArchive'])
        ->name('logistique-generaux.documents.archives');
    
    // Complementary documents
    Route::get('/logistique-generaux/documents/complementaires', [LogistiqueGenerauxController::class, 'complementaryDocuments'])
        ->name('logistique-generaux.documents.complementaires');
    Route::post('/logistique-generaux/documents/complementaires', [LogistiqueGenerauxController::class, 'storeComplementary'])
        ->name('logistique-generaux.documents.complementaires.store');
    Route::post('/logistique-generaux/documents/complementaires/{id}/renew', [LogistiqueGenerauxController::class, 'renewComplementary'])
        ->name('logistique-generaux.documents.complementaires.renew');
    
    Route::get('/logistique-generaux/documents/complementaires/archives', [LogistiqueGenerauxController::class, 'archivedComplementaryDocuments'])
        ->name('logistique-generaux.documents.complementaires.archives');
});

// ===== MARCHÉS & MARKETING ROUTES =====
Route::middleware(['auth', 'verified', 'role:marches-marketing'])->group(function () {
    Route::get('/marches-marketing/dashboard', [MarchesMarketingController::class, 'index'])
        ->name('dashboard.marches-marketing');
    
    Route::get('/marches-marketing/lettres/maintien', [MarchesMarketingController::class, 'lettresMaintien'])
        ->name('lettres.maintien');
    Route::get('/marches-marketing/lettres/ecartement', [MarchesMarketingController::class, 'lettresEcartement'])
        ->name('lettres.ecartement');
    Route::get('/marches-marketing/suivi', [MarchesMarketingController::class, 'suiviMarches'])
        ->name('suivi.marches-marketing');
    
    Route::get('/marches-marketing/marches', [MarchesMarketingController::class, 'globalMarches'])
        ->name('marches.marches-marketing');
    
    Route::get('/marches-marketing/marches/{projet}', [MarchesMarketingController::class, 'show'])
        ->name('marches.projet.show');
    
    Route::get('/marches-marketing/portail', [MarchesMarketingController::class, 'portail'])
        ->name('portail.marches-marketing');
    
    Route::get('/marches-marketing/utilisateurs', [MarchesMarketingController::class, 'users'])
        ->name('users.marches-marketing');

    Route::get('/marches-marketing/traitementdossier', [MarchesMarketingController::class, 'traitementDossier'])
        ->name('traitementdossier.marches-marketing');
    Route::get('/marches-marketing/traitementmarches', [MarchesMarketingController::class, 'traitementMarches'])
        ->name('traitementmarches.marches-marketing');

    // Appels d'Offre
    Route::get('/marches-marketing/fetch-resultats-offres', [MarchesMarketingController::class, 'fetchResultatsOffres'])
        ->name('marches-marketing.fetch-resultats-offres');
    Route::get('/marches-marketing/global-marches', [MarchesMarketingController::class, 'appelOfferPage'])
        ->name('marches-marketing.global-marches');
    Route::get('/marches-marketing/appel-offers-data', [MarchesMarketingController::class, 'getAppelOffersData'])
        ->name('marches-marketing.appel-offers-data');
    Route::get('/marches-marketing/check-available-imports', [MarchesMarketingController::class, 'checkAvailableImports'])
        ->name('marches-marketing.check-available-imports');
    Route::post('/marches-marketing/import-scraped-data', [MarchesMarketingController::class, 'importScrapedData'])
        ->name('marches-marketing.import-scraped-data');
    Route::get('/marches-marketing/list-dao-files', [MarchesMarketingController::class, 'listDaoFiles'])
        ->name('marches-marketing.list-dao-files');
    Route::get('/marches-marketing/download-dao-file', [MarchesMarketingController::class, 'downloadDaoFile'])
        ->name('marches-marketing.download-dao-file');

    // Profils
    Route::get('/marches-marketing/profils/demander', [MarchesMarketingController::class, 'demanderProfils'])
        ->name('marches.profils.demander');
    Route::post('/marches-marketing/profils/demander', [MarchesMarketingController::class, 'storeDemandeProfils'])
        ->name('marches.profils.store');

    // Routes gestion dossiers
    Route::get('/marches-marketing/{marche}/dossiers', [SharedController::class, 'afficherDossiers'])
        ->name('marches.dossiers');
    Route::post('/marches-marketing/{marche}/dossiers', [SharedController::class, 'creerDossier'])
        ->name('dossiers.create');
    Route::post('/marches-marketing/dossiers/{dossier}/taches', [SharedController::class, 'creerTache'])
        ->name('dossiers.taches.create');
    Route::post('/marches-marketing/taches/{tache}/upload', [SharedController::class, 'uploadFichiers'])
        ->name('taches.upload');
    Route::post('/marches-marketing/taches/{tache}/remplacer-fichiers', [SharedController::class, 'remplacerFichierTache'])
        ->name('taches.remplacer-fichiers');
    Route::delete('/marches-marketing/taches/{tache}/fichiers', [SharedController::class, 'supprimerFichier'])
        ->name('taches.fichiers.delete');
    Route::post('/marches-marketing/taches/{tache}/affecter', [SharedController::class, 'affecterTache'])
        ->name('taches.affecter');
    Route::delete('/marches-marketing/affectations/{affectation}', [SharedController::class, 'supprimerAffectation'])
        ->name('affectations.delete');
    Route::patch('/marches-marketing/taches/{tache}/statut', [SharedController::class, 'mettreAJourStatutTache'])
        ->name('taches.update-statut');
    Route::delete('/marches-marketing/taches/{tache}', [SharedController::class, 'supprimerTache'])
        ->name('taches.delete');
});

// ===== QUALITÉ & AUDIT ROUTES =====
Route::middleware(['auth', 'verified', 'role:qualite-audit'])->group(function () {
    Route::get('/qualite-audit/dashboard', [QualiteAuditController::class, 'index'])
        ->name('dashboard.qualite-audit');
});

// ===== NOTIFICATIONS ROUTES =====
Route::middleware(['auth'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
});

// ===== RESSOURCES HUMAINES ROUTES =====
Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->group(function () {
    Route::get('/ressources-humaines/dashboard', [RessourcesHumainesController::class, 'index'])
        ->name('dashboard.ressources-humaines');

    Route::get('/ressources-humaines/tracking', [RessourcesHumainesController::class, 'tracking'])
        ->name('tracking.ressources-humaines');

    Route::get('/ressources-humaines/projets', [RessourcesHumainesController::class, 'projets'])
        ->name('ressources-humaines.projets');

    Route::get('/ressources-humaines/vehicules', [RessourcesHumainesController::class, 'vehicules'])
        ->name('ressources-humaines.vehicules');

    Route::get('/ressources-humaines/progressions', [RessourcesHumainesController::class, 'progressions'])
        ->name('ressources-humaines.progressions');

    Route::get('/ressources-humaines/materiels', [RessourcesHumainesController::class, 'materiels'])
        ->name('ressources-humaines.materiels');

    Route::get('/ressources-humaines/formations', [RessourcesHumainesController::class, 'formations'])
        ->name('ressources-humaines.formations');

    Route::get('/ressources-humaines/CNSSDocuments', [RessourcesHumainesController::class, 'CNSSDocuments'])
        ->name('CNSSDocuments.ressources-humaines');

    Route::get('/ressources-humaines/ContractsDeclarations', [RessourcesHumainesController::class, 'ContractsDeclarations'])
        ->name('ContractsDeclarations');

    Route::get('/ressources-humaines/CVsDiplomas', [RessourcesHumainesController::class, 'CVsDiplomas'])
        ->name('CVsDiplomas');

    Route::get('/ressources-humaines/TeamValidation', [RessourcesHumainesController::class, 'TeamValidation'])
        ->name('TeamValidation');

    Route::get('/ressources-humaines/sousTrais', [RessourcesHumainesController::class, 'SousTrais'])
        ->name('SousTraitants.ressources-humaines');

    Route::get('/ressources-humaines/maps', [RessourcesHumainesController::class, 'Maps'])
        ->name('maps.ressources-humaines');

    Route::get('/ressources-humaines/users', [RessourcesHumainesController::class, 'Users'])
        ->name('users.ressources-humaines');

    // CRUD Routes for Projects
    Route::get('/ressources-humaines/projets-data', [RessourcesHumainesController::class, 'getProjetsData'])
        ->name('ressources-humaines.projets-data');
    Route::get('/ressources-humaines/projets-csv', [RessourcesHumainesController::class, 'getProjetsCsv'])
        ->name('ressources-humaines.projets-csv');
    Route::post('/ressources-humaines/projets', [RessourcesHumainesController::class, 'store'])
        ->name('ressources-humaines.projets.store');
    Route::put('/ressources-humaines/projets/{projet}', [RessourcesHumainesController::class, 'update'])
        ->name('ressources-humaines.projets.update');
    Route::delete('/ressources-humaines/projets/{projet}', [RessourcesHumainesController::class, 'destroy'])
        ->name('ressources-humaines.projets.destroy');

    // CRUD Routes for Vehicles
    Route::post('/ressources-humaines/vehicules', [RessourcesHumainesController::class, 'storeVehicule'])
        ->name('ressources-humaines.vehicules.store');
    Route::put('/ressources-humaines/vehicules/{vehicule}', [RessourcesHumainesController::class, 'updateVehicule'])
        ->name('ressources-humaines.vehicules.update');
    Route::delete('/ressources-humaines/vehicules/{vehicule}', [RessourcesHumainesController::class, 'destroyVehicule'])
        ->name('ressources-humaines.vehicules.destroy');

    // CRUD Routes for Progressions
    Route::post('/ressources-humaines/progressions', [RessourcesHumainesController::class, 'storeProgression'])
        ->name('ressources-humaines.progressions.store');
    Route::put('/ressources-humaines/progressions/{progression}', [RessourcesHumainesController::class, 'updateProgression'])
        ->name('ressources-humaines.progressions.update');
    Route::delete('/ressources-humaines/progressions/{progression}', [RessourcesHumainesController::class, 'destroyProgression'])
        ->name('ressources-humaines.progressions.destroy');

    // CRUD Routes for Materials
    Route::post('/ressources-humaines/materiels', [RessourcesHumainesController::class, 'storeMateriel'])
        ->name('ressources-humaines.materiels.store');
    Route::put('/ressources-humaines/materiels/{materiel}', [RessourcesHumainesController::class, 'updateMateriel'])
        ->name('ressources-humaines.materiels.update');
    Route::delete('/ressources-humaines/materiels/{materiel}', [RessourcesHumainesController::class, 'destroyMateriel'])
        ->name('ressources-humaines.materiels.destroy');

    // CRUD Routes for Formations
    Route::post('/ressources-humaines/formations', [RessourcesHumainesController::class, 'storeFormation'])
        ->name('ressources-humaines.formations.store');
    Route::put('/ressources-humaines/formations/{formation}', [RessourcesHumainesController::class, 'updateFormation'])
        ->name('ressources-humaines.formations.update');
    Route::delete('/ressources-humaines/formations/{formation}', [RessourcesHumainesController::class, 'destroyFormation'])
        ->name('ressources-humaines.formations.destroy');

    // User Management Routes
    Route::get('/users/projets', [RessourcesHumainesController::class, 'getProjects'])
        ->name('user.projects.ressources-humaines');
    Route::get('/users/{user}', [RessourcesHumainesController::class, 'getUser'])
        ->name('user.show.ressources-humaines');
    Route::post('/users', [RessourcesHumainesController::class, 'storeUsers'])
        ->name('user.store.ressources-humaines');
    Route::put('/users/{salarie}', [RessourcesHumainesController::class, 'enableDisableUser'])
        ->name('user.update.ressources-humaines');
    Route::put('/userPass/{salarie}', [RessourcesHumainesController::class, 'updateUserPass'])
        ->name('user.updatePass.ressources-humaines');
    Route::put('/userProjet/{salarie}', [RessourcesHumainesController::class, 'affecteGrantUser'])
        ->name('user.updateProject.ressources-humaines');

    // Sous-Traitants Routes
    Route::get('/sousTrais', [RessourcesHumainesController::class, 'getSousTrais'])
        ->name('sousTrais.get.ressources-humaines');
    Route::post('/sousTrais', [RessourcesHumainesController::class, 'storeSousTrais'])
        ->name('sousTrais.store.ressources-humaines');

    // Access Management Routes
    Route::get('/ressources-humaines/access', [RessourcesHumainesController::class, 'access'])
        ->name('ressources-humaines.access');
    Route::post('/ressources-humaines/access', [RessourcesHumainesController::class, 'storeAccess'])
        ->name('ressources-humaines.access.store');
    Route::put('/ressources-humaines/access/{user}', [RessourcesHumainesController::class, 'updateAccess'])
        ->name('ressources-humaines.access.update');
    Route::delete('/ressources-humaines/access/{user}', [RessourcesHumainesController::class, 'destroyAccess'])
        ->name('ressources-humaines.access.destroy');
    Route::post('/ressources-humaines/access/{salarie}/affecter-projets', [RessourcesHumainesController::class, 'affecterProjets'])
        ->name('ressources-humaines.access.affecter-projets');
    Route::post('/ressources-humaines/access/{salarie}/affecter-profil', [RessourcesHumainesController::class, 'affecterProfil'])
        ->name('ressources-humaines.access.affecter-profil');
    Route::post('/ressources-humaines/access/profil/store', [RessourcesHumainesController::class, 'storeProfil'])
        ->name('ressources-humaines.access.profil.store');

    // Appels d'Offres Routes
    Route::get('/ressources-humaines/fetch-projets-direct', [RessourcesHumainesController::class, 'fetchProjetsDirect'])
        ->name('ressources-humaines.fetch-projets-direct');
    Route::get('/ressources-humaines/fetch-resultats-offres', [RessourcesHumainesController::class, 'fetchResultatsOffres'])
        ->name('ressources-humaines.fetch-resultats-offres');
    Route::get('/ressources-humaines/appel-offer', [RessourcesHumainesController::class, 'appelOfferPage'])
        ->name('ressources-humaines.appel-offer');
    Route::get('/ressources-humaines/appel-offers-data', [RessourcesHumainesController::class, 'getAppelOffersData'])
        ->name('ressources-humaines.appel-offers-data');

######################################################################################################

    // Importer les documents
    Route::post('/ressources-humaines/imported-documents', [RessourcesHumainesController::class, 'storeImportedDocuments'])
        ->name('ressources-humaines.imported-documents.store');

    Route::get('/ressources-humaines/imported-documents/{marcheId}', [RessourcesHumainesController::class, 'getImportedDocuments'])
        ->name('ressources-humaines.imported-documents.get');

    Route::get('/ressources-humaines/download-imported-file', [RessourcesHumainesController::class, 'downloadImportedFile'])
        ->name('ressources-humaines.download-imported-file');

    Route::get('/ressources-humaines/download-file', function(Request $request) {
        $path = $request->get('path');
        $fullPath = storage_path('app/public/' . str_replace('/storage/', '', $path));

        if (file_exists($fullPath)) {
            return response()->file($fullPath);
        }

        abort(404, 'Fichier non trouvé');
    })->name('ressources-humaines.download-file');
    
    Route::get('/ressources-humaines/list-imported-files/{marcheId}', function($marcheId) {
        try {
            $projetMp = \App\Models\ProjetMp::findOrFail($marcheId);
            $reference = preg_replace('/[^\w\-\.]/', '_', $projetMp->reference);
            
            $basePath = storage_path("app/public/marche_public/imported_files/{$reference}");
            
            if (!is_dir($basePath)) {
                return response()->json(['error' => 'Dossier non trouvé', 'path' => $basePath], 404);
            }
            
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($basePath, \RecursiveDirectoryIterator::SKIP_DOTS)
            );
            
            $files = [];
            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $relativePath = str_replace($basePath . DIRECTORY_SEPARATOR, '', $file->getPathname());
                    $files[] = [
                        'name' => $file->getFilename(),
                        'path' => $relativePath,
                        'size' => $file->getSize(),
                        'modified' => date('Y-m-d H:i:s', $file->getMTime()),
                    ];
                }
            }
            
            return response()->json([
                'marche_id' => $marcheId,
                'reference' => $projetMp->reference,
                'base_path' => $basePath,
                'files_count' => count($files),
                'files' => $files,
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    })->name('ressources-humaines.list-imported-files');

});

Route::get('/download-imported-file', function(Request $request) {
    $filePath = $request->get('path');
    
    if (!$filePath) {
        abort(400, 'Chemin du fichier manquant');
    }

    if (!str_contains($filePath, 'imported_files')) {
        abort(403, 'Accès non autorisé');
    }

    $fullPath = storage_path('app/public/' . ltrim($filePath, '/'));

    if (file_exists($fullPath) && is_file($fullPath)) {
        return response()->download($fullPath);
    }

    abort(404, 'Fichier non trouvé');
})->name('download.imported.file.fallback');

######################################################################################################

    // Bons de Commande Routes
    Route::get('/ressources-humaines/bons-commandes', [RessourcesHumainesController::class, 'getBonsCommandeData'])
        ->name('bons-commandes');
    Route::post('/ressources-humaines/fetch-bons-commande', [RessourcesHumainesController::class, 'fetchBonsCommande'])
        ->name('fetch-bons-commande');
    Route::post('/ressources-humaines/import-bons-json', [RessourcesHumainesController::class, 'importBonsFromJson'])
        ->name('import-bons-json');
    Route::get('/ressources-humaines/scraping-status', [RessourcesHumainesController::class, 'getScrapingStatus'])
        ->name('scraping-status');
    Route::get('/ressources-humaines/list-dao-files', [RessourcesHumainesController::class, 'listDaoFiles'])
        ->name('list-dao-files');
    Route::get('/ressources-humaines/download-dao-file', [RessourcesHumainesController::class, 'downloadDaoFile'])
        ->name('download-dao-file');

    // Marchés Publics Routes
    Route::get('/ressources-humaines/fetch-marche-public', [RessourcesHumainesController::class, 'fetchMarchePublic'])
        ->name('ressources-humaines.fetch-marche-public');
    Route::get('/ressources-humaines/marche-public', [RessourcesHumainesController::class, 'getMarchePublicData'])
        ->name('ressources-humaines.marche-public');
    Route::get('/ressources-humaines/marche-public-page', [RessourcesHumainesController::class, 'marchePublicPage'])
        ->name('ressources-humaines.marche-public-page');
    Route::get('/ressources-humaines/marches-publics-data', [RessourcesHumainesController::class, 'getMarchesPublicsData'])
        ->name('ressources-humaines.marches-publics-data');
    Route::post('/ressources-humaines/automate-consultation', [RessourcesHumainesController::class, 'automateConsultation'])
        ->name('ressources-humaines.automate-consultation');

    // Résultats Bon Commande Routes
    Route::get('/ressources-humaines/fetch-resultats-bon-commande', [RessourcesHumainesController::class, 'fetchResultatsBonCommande'])
        ->name('ressources-humaines.fetch-resultats-bon-commande');
    Route::get('/ressources-humaines/resultats-bon-commande', [RessourcesHumainesController::class, 'getResultatsBonCommandeData'])
        ->name('ressources-humaines.resultats-bon-commande');
    Route::get('/ressources-humaines/resultats-bon-commande-page', [RessourcesHumainesController::class, 'resultatsBonCommandePage'])
        ->name('ressources-humaines.resultats-bon-commande-page');

    // Methodology Validation Routes
    Route::get('/ressources-humaines/MethodologyValidation', [RessourcesHumainesController::class, 'MethodologyValidation'])
        ->name('MethodologyValidation');
    Route::post('/ressources-humaines/methodologie/validate', [RessourcesHumainesController::class, 'validateMethodology'])
        ->name('methodologie.validate');
    Route::get('/ressources-humaines/methodologie/{document}/download', [RessourcesHumainesController::class, 'downloadMethodology'])
        ->name('methodologie.rh.download');

    // References Routes
    Route::get('/ressources-humaines/references', [RessourcesHumainesController::class, 'References'])
        ->name('references.index');
    Route::get('/ressources-humaines/references/{id}', [RessourcesHumainesController::class, 'showReference'])
        ->name('references.show');
    Route::post('/ressources-humaines/references/{id}/validate', [RessourcesHumainesController::class, 'validateReference'])
        ->name('references.validate');
    Route::get('/ressources-humaines/references/{id}/download', [RessourcesHumainesController::class, 'downloadReferenceDocument'])
        ->name('references.download');

    // Entretiens Routes
    Route::get('/ressources-humaines/entretiens', [RessourcesHumainesController::class, 'indexEntretiens'])
        ->name('entretiens.index');
    Route::get('/ressources-humaines/entretiens/create', [RessourcesHumainesController::class, 'createEntretien'])
        ->name('entretiens.create');
    Route::post('/ressources-humaines/entretiens', [RessourcesHumainesController::class, 'storeEntretien'])
        ->name('entretiens.store');
    Route::get('/ressources-humaines/entretiens/{entretien}', [RessourcesHumainesController::class, 'showEntretien'])
        ->name('entretiens.show');
    Route::put('/ressources-humaines/entretiens/{entretien}', [RessourcesHumainesController::class, 'updateEntretien'])
        ->name('entretiens.update');
    Route::delete('/ressources-humaines/entretiens/{entretien}', [RessourcesHumainesController::class, 'destroyEntretien'])
        ->name('entretiens.destroy');
    Route::get('/ressources-humaines/entretiens/{entretien}/export', [RessourcesHumainesController::class, 'exportEntretien'])
        ->name('entretiens.export');
    Route::get('/ressources-humaines/entretiens/{entretien}/download/{type}', [RessourcesHumainesController::class, 'downloadDocument'])
        ->name('entretiens.download');

    // Profils Demandes Routes
    Route::get('/ressources-humaines/profils/demandes', [RessourcesHumainesController::class, 'profilsDemandes'])
        ->name('rh.profils.demandes');
    Route::post('/ressources-humaines/profils/demandes/{demande}', [RessourcesHumainesController::class, 'updateStatutDemande'])
        ->name('rh.profils.demandes.update');
    Route::get('/ressources-humaines/profils/search', [RessourcesHumainesController::class, 'searchProfils'])
        ->name('rh.profils.search');
    Route::post('/ressources-humaines/profils/assign-to-project', [RessourcesHumainesController::class, 'assignToProject'])
        ->name('rh.profils.assign-to-project');

    // File Download Route
    Route::get('/ressources-humaines/download-file', function(Request $request) {
        $path = $request->get('path');
        $fullPath = storage_path('app/public/' . str_replace('/storage/', '', $path));
        
        if (file_exists($fullPath)) {
            return response()->download($fullPath);
        }
        
        abort(404);
    })->name('download.file');

    // ZIP File Routes
    Route::get('/ressources-humaines/list-dao-files', function (Request $request) {
        $zipUrl = $request->query('zipPath');
        if (!$zipUrl) return response()->json([], 400);

        $tempZip = tempnam(sys_get_temp_dir(), 'dao');
        file_put_contents($tempZip, file_get_contents($zipUrl));

        $zip = new \ZipArchive();
        $files = [];

        if ($zip->open($tempZip) === true) {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $files[] = [
                    'name' => $zip->getNameIndex($i),
                    'path' => $zip->getNameIndex($i),
                ];
            }
            $zip->close();
        }

        unlink($tempZip);
        return response()->json($files);
    });

    Route::get('/ressources-humaines/download-dao-file', function (Request $request) {
        $zipUrl = $request->query('zipPath');
        $filePath = $request->query('filePath');
        if (!$zipUrl || !$filePath) return response('Paramètre manquant', 400);

        $tempZip = tempnam(sys_get_temp_dir(), 'dao');
        file_put_contents($tempZip, file_get_contents($zipUrl));

        $zip = new \ZipArchive();
        $content = null;
        if ($zip->open($tempZip) === true) {
            $content = $zip->getFromName($filePath);
            $zip->close();
        }

        unlink($tempZip);

        if ($content === null) return response('Fichier introuvable', 404);

        return response($content)
            ->header('Content-Disposition', 'attachment; filename="' . basename($filePath) . '"');
    });

// ===== SUIVI & CONTRÔLE ROUTES =====
Route::middleware(['auth', 'verified', 'role:suivi-controle'])->group(function () {

    // ===== DASHBOARD =====
    Route::get('/suivi-controle/dashboard', [SuiviControleController::class, 'index'])
        ->name('dashboard.suivi-controle');

    // ===== MAIN PAGES =====
    Route::get('/suivi-controle/terrains', [SuiviControleController::class, 'Terrains'])
        ->name('terrains.suivi-controle');

    Route::get('/suivi-controle/Planing', [SuiviControleController::class, 'Planing'])
        ->name('Planing.suivi-controle');

    Route::get('/suivi-controle/Tracking', [SuiviControleController::class, 'Tracking'])
        ->name('Tracking.suivi-controle');

    Route::get('/suivi-controle/ressources', [SuiviControleController::class, 'Ressources'])
        ->name('ressources.suivi-controle');

    Route::get('/suivi-controle/suiviProjet', [SuiviControleController::class, 'suiviProjet'])
        ->name('suiviProjet.suivi-controle');

    // ===== DATA FETCHING =====
    Route::get('/suivi-controle/fetch-data', [SuiviControleController::class, 'fetchData']);
    Route::get('/suivi-controle/fetch-terrains', [SuiviControleController::class, 'fetchTerrains']);
    Route::get('/suivi-controle/fetch-salarie/{id}', [SuiviControleController::class, 'fetchSalarieData']);
    Route::get('/suivi-controle/fetch-plans', [SuiviControleController::class, 'fetchDataPlanings']); // from 2nd snippet
    Route::get('/suivi-controle/fetch-all-data', [SuiviControleController::class, 'fetchAll']);
    Route::get('/suivi-controle/fetch-projet/{id}', [SuiviControleController::class, 'getProjetRessources']);
    Route::get('/suivi-controle/fetch-projetData/{id}', [SuiviControleController::class, 'getProjetStats']);
    Route::get('/suivi-controle/download-projetDoc/{id}', [SuiviControleController::class, 'getProjetDoc']);

    // ===== CRUD TERRAIN / PROJET =====
    Route::post('/suivi-controle/terrain', [SuiviControleController::class, 'createTerrain']);
    Route::put('/suivi-controle/ProjetSals', [SuiviControleController::class, 'updateProjetSalaries']);
    Route::put('/suivi-controle/terrain/{id}', [SuiviControleController::class, 'editTerrain']);
    Route::delete('/suivi-controle/terrain/{id}', [SuiviControleController::class, 'deleteTerrain']);

    // ===== AFFECTATION / NOTIFICATION =====
    Route::put('/suivi-controle/notif/{id}', [SuiviControleController::class, 'deactivateNotif']);
    Route::post('/suivi-controle/terrain/affect-grant', [SuiviControleController::class, 'affectGrantSalarie']);
    Route::post('/suivi-controle/terrain/affect-grant-user', [SuiviControleController::class, 'affectGrantUser']); // from 1st snippet
    Route::post('/suivi-controle/docReqEntry', [SuiviControleController::class, 'storeDocRequis']); // from 2nd snippet

    // ===== PLANS & TASKS =====
    Route::post('/suivi-controle/plans', [SuiviControleController::class, 'createPlan']); // from 2nd
    Route::post('/suivi-controle/storeTask', [SuiviControleController::class, 'storeTask']);
    Route::put('/suivi-controle/plans/{id}', [SuiviControleController::class, 'updatePlan']);
    Route::delete('/suivi-controle/plans/{id}', [SuiviControleController::class, 'deletePlan']);

    // ===== CHAT (from 2nd snippet) =====
    Route::post('/suivi-controle/chat', [SuiviControleController::class, 'sendChat']);

    // ===== PROJECT DOCUMENT APPROVAL =====
    Route::put('/suivi-controle/approuve-projetDoc/{id}', [SuiviControleController::class, 'approuveProjetDoc']);
    Route::put('/suivi-controle/comment-projetDoc/{id}', [SuiviControleController::class, 'commentProjetDoc']);
});


Route::middleware('auth.basic')->group(function () {
    Route::get('/suivi-controle/fetch-plans', [SuiviControleController::class, 'fetchDataPlanings']);

    Route::get('/suivi-controle/fetch-projetData/{id}', [SuiviControleController::class, 'getProjetStats']);

});


// ===== DASHBOARD ROUTE =====
Route::get('/dashboard', function () {
    $user = auth()->user();
    return match (true) {
        $user->hasRole('admin') => redirect()->route('dashboard.direction-generale'),
        $user->hasRole('marches-marketing') => redirect()->route('dashboard.marches-marketing'),
        $user->hasRole('direction-generale') => redirect()->route('dashboard.direction-generale'),
        $user->hasRole('communication-digitale') => redirect()->route('dashboard.communication-digitale'),
        $user->hasRole('etudes-techniques') => redirect()->route('dashboard.etudes-techniques'),
        $user->hasRole('financier-comptabilite') => redirect()->route('dashboard.financier-comptabilite'),
        $user->hasRole('fournisseurs-traitants') => redirect()->route('dashboard.fournisseurs-traitants'),
        $user->hasRole('innovation-transition') => redirect()->route('dashboard.innovation-transition'),
        $user->hasRole('juridique') => redirect()->route('dashboard.juridique'),
        $user->hasRole('logistique-generaux') => redirect()->route('dashboard.logistique-generaux'),
        $user->hasRole('qualite-audit') => redirect()->route('dashboard.qualite-audit'),
        $user->hasRole('ressources-humaines') => redirect()->route('dashboard.ressources-humaines'),
        $user->hasRole('suivi-controle') => redirect()->route('dashboard.suivi-controle'),
        default => redirect('/'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// ===== SCREENSHOTS ROUTES =====
Route::middleware(['auth'])->group(function () {
    // API Routes for screenshot capture
    Route::post('/api/screenshots', [ScreenshotController::class, 'store'])
        ->name('api.screenshots.store');
    Route::delete('/api/screenshots/{screenshot}', [ScreenshotController::class, 'deleteOwn'])
        ->name('api.screenshots.destroy');

    // View and download routes
    Route::get('/screenshots/view/{id}', [ScreenshotController::class, 'viewById'])
        ->name('screenshots.view')
        ->where('id', '[0-9]+');
    Route::get('/screenshots/download/{id}', [ScreenshotController::class, 'downloadById'])
        ->name('screenshots.download')
        ->where('id', '[0-9]+');
    Route::get('/storage/screenshots/{path}', [ScreenshotController::class, 'serveStorage'])
        ->where('path', '.*')
        ->name('storage.screenshots');

    // Admin routes (Direction Générale + RH only)
    Route::middleware('role:admin|ressources-humaines')->group(function () {
        Route::get('/admin/screenshots/data', [ScreenshotController::class, 'adminIndex'])
            ->name('admin.screenshots.data');
        Route::get('/admin/screenshots/stats', [ScreenshotController::class, 'adminStats'])
            ->name('admin.screenshots.stats');
        Route::get('/admin/screenshots/users', [ScreenshotController::class, 'getUsers'])
            ->name('admin.screenshots.users');
        Route::get('/admin/screenshots', [ScreenshotController::class, 'adminView'])
            ->name('admin.screenshots');
        Route::get('/admin/screenshots/{screenshot}/details', [ScreenshotController::class, 'show'])
            ->name('admin.screenshots.show');
        Route::delete('/admin/screenshots/{screenshot}', [ScreenshotController::class, 'destroy'])
            ->name('admin.screenshots.destroy');
    });
});

// ===== DOCUMENTATION MODULE ROUTES =====
Route::middleware(['auth', 'permission:module documentation'])->group(function () {
    Route::get('/documents', [SharedController::class, 'documents'])
        ->name('documents.index');
    Route::post('/documents', [SharedController::class, 'storeDocument'])
        ->name('documents.store');
    Route::post('/documents/{id}/renew', [SharedController::class, 'renewDocument'])
        ->name('documents.renew');
    Route::get('/documents/archives', [SharedController::class, 'DocumentsArchive'])
        ->name('documents.archives');

    // Complementary Documents
    Route::get('/documents-complementaires', [SharedController::class, 'complementaryDocuments'])
        ->name('documents.complementaires.index');
    Route::post('/documents-complementaires', [SharedController::class, 'storeComplementary'])
        ->name('documents.complementaires.store');
    Route::post('/documents-complementaires/{id}/renew', [SharedController::class, 'renewComplementary'])
        ->name('documents.complementaires.renew');
    Route::get('/documents-complementaires/archives', [SharedController::class, 'archivedComplementaryDocuments'])
        ->name('documents.complementaires.archives');

    // Documentation Recherche
    Route::get('/documentation/marches', [DocumentationRechercheController::class, 'RechercheDocumentation'])
        ->name('documentation.marches.index');
    Route::get('/documentation/marches/{id}', [DocumentationRechercheController::class, 'AfficherRechercheDocumentation'])
        ->name('documentation.marches.show');
});

// ===== SHARED MARCHES PUBLIC ROUTES =====
Route::middleware(['auth', 'permission:module marche public', 'permission:module marche global', 'permission:les marches'])->group(function () {
    Route::get('marches-publics', [SharedController::class, 'marchesPublic'])
        ->name('marchesPublic');
    Route::get('global-marches', [SharedController::class, 'GlobalMarches'])
        ->name('GlobalMarches');
    Route::get('marches/aos-selectionnes', [SharedController::class, 'aosSelectionnes'])
        ->name('aosSelectionnes');

    Route::post('marches/{id}/accept', [SharedController::class, 'acceptMP'])
        ->name('marchesPublic.accept');
    Route::post('marches/{id}/select', [SharedController::class, 'selectMP'])
        ->name('marchesPublic.select');
    Route::post('marches/{id}/reject', [SharedController::class, 'rejectMP'])
        ->name('marchesPublic.reject');
    Route::post('marches/{id}/accept-initial', [SharedController::class, 'acceptIMP'])
        ->name('marchesPublic.acceptInitial');
    Route::post('marches/{id}/annule', [SharedController::class, 'annulerMP'])
        ->name('marchesPublic.annulerMP');
});

Route::middleware(['auth', 'permission:les marches'])->group(function () {
    Route::get('marches/encours', [SharedController::class, 'marchesEnCours'])
        ->name('marches.encours');
    Route::get('marches/annulee', [SharedController::class, 'marchesAnnulee'])
        ->name('marches.annulee');
    Route::get('marches/rejetee', [SharedController::class, 'marchesRejetee'])
        ->name('marches.rejetee');
    Route::get('marches/terminee', [SharedController::class, 'marchesTerminee'])
        ->name('marches.terminee');
});

// ===== TRACABILITE ROUTES =====
Route::middleware(['auth', 'web'])->group(function () {
    Route::get('/marches-marketing/tracabilite', [TracabiliteController::class, 'tracabilite'])
        ->name('users.marches-marketing');
    Route::get('/dossiers/{dossierId}/fichiers', [TracabiliteController::class, 'getDossierFichiers']);
    Route::get('/dossiers/{dossierId}/taches', [TracabiliteController::class, 'getDossierTaches']);
    Route::get('/dossiers/{dossierId}/timeline', [TracabiliteController::class, 'getDossierTimeline']);
    Route::get('/participants/{participantId}/taches', [TracabiliteController::class, 'getParticipantTaches']);
    Route::get('/participants/{participantId}/temps', [TracabiliteController::class, 'getParticipantTemps']);
    Route::get('/marches/{marcheId}/historique', [TracabiliteController::class, 'getMarcheHistorique']);
});

// ===== DEBUG ROUTES =====
Route::get('/debug-salaries', function () {
    $salaries = Salarie::with(['profil', 'projets', 'user'])->get();

    return response()->json([
        'salaries_count' => $salaries->count(),
        'salaries' => $salaries->map(function ($salarie) {
            return [
                'id' => $salarie->id,
                'nom' => $salarie->nom,
                'prenom' => $salarie->prenom,
                'profil_id' => $salarie->profil_id,
                'profil' => $salarie->profil ? [
                    'id' => $salarie->profil->id,
                    'poste_profil' => $salarie->profil->poste_profil,
                    'niveau_experience' => $salarie->profil->niveau_experience,
                ] : null,
                'projets_count' => $salarie->projets->count(),
                'user' => $salarie->user ? [
                    'id' => $salarie->user->id,
                    'name' => $salarie->user->name,
                    'email' => $salarie->user->email,
                ] : null,
            ];
        }),
    ]);
});

Route::get('/check-salarie-columns', function() {
    $columns = \DB::select('SHOW COLUMNS FROM salaries');
    $columnNames = collect($columns)->pluck('Field');
    
    $requiredColumns = [
        'contrat_cdi_path',
        'cv_path',
        'diplome_path',
        'certificat_travail_path'
    ];
    
    $missing = [];
    foreach ($requiredColumns as $col) {
        if (!$columnNames->contains($col)) {
            $missing[] = $col;
        }
    }
    
    return response()->json([
        'has_all_columns' => empty($missing),
        'missing_columns' => $missing,
        'all_columns' => $columnNames,
    ]);
});

Route::get('/debug/entretien/{entretien}', [DebugEntretienController::class, 'debugEntretien'])
    ->name('debug.entretien');

Route::get('/debug/entretien/{entretien}/test/{type}', [DebugEntretienController::class, 'testFileAccess'])
    ->name('debug.test.file');

Route::get('/quick-test', function () {
    $rhUsersCount = \App\Models\User::role('ressources-humaines')->count();
    $notificationsCount = \Illuminate\Notifications\DatabaseNotification::count();
    $documentExists = \App\Models\MethodologyDocument::exists();
    
    return [
        'rh_users_found' => $rhUsersCount,
        'total_notifications' => $notificationsCount,
        'documents_exist' => $documentExists,
        'queue_driver' => config('queue.default'),
    ];
});

// Debug routes for notification testing
Route::prefix('debug')->middleware('auth')->group(function () {
    Route::get('/check-rh-users', function () {
        try {
            $rhUsers = \App\Models\User::role('ressources-humaines')->get();
            
            return response()->json([
                'success' => true,
                'count' => $rhUsers->count(),
                'users' => $rhUsers->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->getRoleNames(),
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ]);
        }
    });

    Route::get('/check-all-users-roles', function () {
        $users = \App\Models\User::with('roles')->get();
        
        return response()->json([
            'success' => true,
            'total_users' => $users->count(),
            'users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'roles' => $user->getRoleNames(),
                ];
            }),
        ]);
    });

    Route::get('/check-notifications', function () {
        $notifications = \Illuminate\Notifications\DatabaseNotification::latest()->take(10)->get();
        
        return response()->json([
            'success' => true,
            'total' => \Illuminate\Notifications\DatabaseNotification::count(),
            'latest' => $notifications->map(function ($notif) {
                return [
                    'id' => $notif->id,
                    'type' => $notif->type,
                    'notifiable_id' => $notif->notifiable_id,
                    'notifiable_type' => $notif->notifiable_type,
                    'data' => $notif->data,
                    'read_at' => $notif->read_at,
                    'created_at' => $notif->created_at,
                ];
            }),
        ]);
    });

    Route::get('/test-notification', function () {
        try {
            $rhUser = \App\Models\User::role('ressources-humaines')->first();
            
            if (!$rhUser) {
                return response()->json([
                    'success' => false,
                    'error' => 'No RH user found with role "ressources-humaines"',
                ]);
            }

            $document = \App\Models\MethodologyDocument::first();
            
            if (!$document) {
                return response()->json([
                    'success' => false,
                    'error' => 'No document found for testing',
                ]);
            }

            $rhUser->notify(new \App\Notifications\MethodologyDocumentNotification(
                $document,
                'submitted',
                'Test notification from debug route'
            ));

            $lastNotification = \Illuminate\Notifications\DatabaseNotification::where('notifiable_id', $rhUser->id)
                ->latest()
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Notification sent successfully',
                'rh_user' => [
                    'id' => $rhUser->id,
                    'name' => $rhUser->name,
                    'email' => $rhUser->email,
                    'roles' => $rhUser->getRoleNames(),
                ],
                'document' => [
                    'id' => $document->id,
                    'type' => $document->type,
                    'file_name' => $document->file_name,
                ],
                'notification_created' => $lastNotification ? [
                    'id' => $lastNotification->id,
                    'type' => $lastNotification->type,
                    'data' => $lastNotification->data,
                    'created_at' => $lastNotification->created_at,
                ] : null,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    });

    Route::get('/test-upload-flow', function () {
        try {
            $currentUser = auth()->user();
            $rhUsers = \App\Models\User::role('ressources-humaines')->get();
            
            $results = [
                'current_user' => [
                    'id' => $currentUser->id,
                    'name' => $currentUser->name,
                    'roles' => $currentUser->getRoleNames(),
                ],
                'rh_users_found' => $rhUsers->count(),
                'rh_users' => $rhUsers->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                    ];
                }),
                'notifications_sent' => [],
                'errors' => [],
            ];

            $document = new \App\Models\MethodologyDocument([
                'user_id' => $currentUser->id,
                'type' => 'methodologie',
                'file_name' => 'test_document.pdf',
                'file_path' => 'test/path.pdf',
                'file_size' => 1024,
                'mime_type' => 'application/pdf',
                'status' => 'submitted',
            ]);
            $document->save();

            $results['document_created'] = [
                'id' => $document->id,
                'type' => $document->type,
                'status' => $document->status,
            ];

            foreach ($rhUsers as $rhUser) {
                try {
                    $rhUser->notify(new \App\Notifications\MethodologyDocumentNotification(
                        $document,
                        'submitted'
                    ));

                    $lastNotification = \Illuminate\Notifications\DatabaseNotification::where('notifiable_id', $rhUser->id)
                        ->latest()
                        ->first();

                    $results['notifications_sent'][] = [
                        'rh_user_id' => $rhUser->id,
                        'rh_user_name' => $rhUser->name,
                        'notification_created' => $lastNotification ? true : false,
                        'notification_id' => $lastNotification?->id,
                        'notification_data' => $lastNotification?->data,
                    ];

                } catch (\Exception $e) {
                    $results['errors'][] = [
                        'rh_user_id' => $rhUser->id,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            $document->delete();

            return response()->json([
                'success' => true,
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    });

    Route::get('/user-notifications/{userId}', function ($userId) {
        $user = \App\Models\User::find($userId);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not found',
            ]);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ],
            'total_notifications' => $user->notifications()->count(),
            'unread_notifications' => $user->unreadNotifications()->count(),
            'latest_notifications' => $user->notifications()->latest()->take(5)->get()->map(function ($n) {
                return [
                    'id' => $n->id,
                    'type' => $n->type,
                    'data' => $n->data,
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at,
                ];
            }),
        ]);
    });

    Route::get('/quick-test', function () {
        $rhUsersCount = \App\Models\User::role('ressources-humaines')->count();
        $notificationsCount = \Illuminate\Notifications\DatabaseNotification::count();
        $documentExists = \App\Models\MethodologyDocument::exists();
        
        return response()->json([
            'status' => 'OK',
            'rh_users_found' => $rhUsersCount,
            'total_notifications' => $notificationsCount,
            'documents_exist' => $documentExists,
            'queue_driver' => config('queue.default'),
            'message' => $rhUsersCount > 0 
                ? '✅ System looks good!' 
                : '⚠️ No RH users found!',
        ]);
    });
});

// ===== BROADCAST ROUTES =====
Broadcast::routes(['middleware' => ['auth:web']]);

// ===== REQUIRED AUTH FILES =====
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';