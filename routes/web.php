<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Broadcast;
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
use App\Events\NewNotification;
use App\Models\User;
use App\Models\Salarie;
use App\Models\Notification;
use App\Notifications\TestNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;


Route::get('/', function () {
    $user = auth()->user();

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

Route::get('/test-notification', function () {
    $user = User::first(); // or auth()->user()
    $user->notify(new TestNotification("Hello, this is a test notification 🚀"));
    return "Notification sent!";
});

// Route::get('/dashboard', function () {
//     return Inertia::render('dashboard', [
//         'auth' => [
//             'user' => auth()->user(),
//         ],
//     ]);
// })->middleware(['auth', 'verified'])->name('dashboard');

// Direction Générale (Admin)
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/direction-generale/dashboard', [DirectionGeneraleController::class, 'index'])
        ->name('dashboard.direction-generale');
    
    Route::get('/direction-generale/boite-decision', [DirectionGeneraleController::class, 'boiteDecision'])
        ->name('direction-generale.boiteDecision');
        Route::get('/direction-generale/boite-decision-marche', [DirectionGeneraleController::class, 'marcheDecision'])
        ->name('direction-generale.boiteDecision');

        Route::post('/direction-generale/profile-decision/{salarie}', [DirectionGeneraleController::class, 'handleSalarieDecision'])
        ->name('direction-generale.handleSalarieDecision');
        Route::post('/direction-generale/marche/{id}/accepter', [DirectionGeneraleController::class, 'accepterMarche'])
            ->name('direction-generale.accepter-marche');
    
        Route::post('/direction-generale/marche/{id}/refuser', [DirectionGeneraleController::class, 'refuserMarche'])
            ->name('direction-generale.refuser-marche');










            // Entretiens en attente de validation
    Route::get('direction-generale/entretiens/validation', [DirectionGeneraleController::class, 'entretiensValidation'])
        ->name('direction-generale.entretiens.validation');
    
    // Valider un entretien
    Route::post('direction-generale/entretiens/{entretien}/valider', [DirectionGeneraleController::class, 'validerEntretien'])
        ->name('direction-generale.entretiens.valider');
    
    // Rejeter un entretien
    Route::post('direction-generale/entretiens/{entretien}/rejeter', [DirectionGeneraleController::class, 'rejeterEntretien'])
        ->name('direction-generale.entretiens.rejeter');
    
    // Voir détails entretien
    Route::get('direction-generale/entretiens/{entretien}', [DirectionGeneraleController::class, 'showEntretien'])
        ->name('direction-generale.entretiens.show');
    
    // Export PDF entretien
    Route::get('direction-generale/entretiens/{entretien}/export', [DirectionGeneraleController::class, 'exportEntretien'])
        ->name('direction-generale.entretiens.export');

    Route::get('direction-generale/entretiens/{entretien}/document/{type}', [DirectionGeneraleController::class, 'downloadDocument'])
    ->name('direction-generale.entretiens.document');
});

// Communication Digitale
Route::middleware(['auth', 'verified', 'role:communication-digitale'])->group(function () {
    Route::get('/communication-digitale/dashboard', [CommunicationDigitaleController::class, 'index'])
        ->name('dashboard.communication-digitale');
});

// Études Techniques
Route::middleware(['auth', 'verified', 'role:etudes-techniques'])->group(function () {
    Route::get('/etudes-techniques/dashboard', [EtudesTechniquesController::class, 'index'])
        ->name('dashboard.etudes-techniques');
});

// Financier & Comptabilité
Route::middleware(['auth', 'verified', 'role:financier-comptabilite'])->group(function () {
    Route::get('/financier-comptabilite/dashboard', [FinancierComptabiliteController::class, 'index'])
        ->name('dashboard.financier-comptabilite');
});

// Fournisseurs & Traitants Routes
Route::middleware(['auth', 'verified', 'role:fournisseurs-traitants'])->group(function () {
    // Dashboard
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
    
    Route::get('/fournisseurs-traitants/References', [FournisseursTraitantsController::class, 'References'])
        ->name('References.fournisseurs-traitants');
    
    Route::get('/fournisseurs-traitants/TeamTable', [FournisseursTraitantsController::class, 'TeamTable'])
        ->name('TeamTable.fournisseurs-traitants');







    




        // References
        Route::get('/fournisseurs-traitants/references', [FournisseursTraitantsController::class, 'References'])
            ->name('references.index');
        
        // Store new reference
        Route::post('/fournisseurs-traitants/references/store', [FournisseursTraitantsController::class, 'storeReference'])
            ->name('references.store');
        
        // Show single reference details
        Route::get('/fournisseurs-traitants/references/{id}', [FournisseursTraitantsController::class, 'showReference'])
            ->name('references.show');
        
        // Update reference (only if pending)
        Route::put('/fournisseurs-traitants/references/{id}', [FournisseursTraitantsController::class, 'updateReference'])
            ->name('references.update');
        
        // Delete reference (only if pending)
        Route::delete('/fournisseurs-traitants/references/{id}', [FournisseursTraitantsController::class, 'deleteReference'])
            ->name('references.destroy');
        
        // Download reference document
        Route::get('/fournisseurs-traitants/references/{id}/download', [FournisseursTraitantsController::class, 'downloadReferenceDocument'])
            ->name('references.download');



        Route::prefix('fournisseurs-traitants')->group(function () {
        // Main references page
        Route::get('/references', [App\Http\Controllers\FournisseursTraitantsController::class, 'References'])
            ->name('fournisseurs-traitants.references');
        
        // Store new reference - THIS IS THE IMPORTANT ONE
        Route::post('/references/store', [App\Http\Controllers\FournisseursTraitantsController::class, 'storeReference'])
            ->name('fournisseurs-traitants.references.store');
        
        // Delete reference
        Route::delete('/references/{id}', [App\Http\Controllers\FournisseursTraitantsController::class, 'deleteReference'])
            ->name('fournisseurs-traitants.references.destroy');
        });


});

// Innovation & Transition
Route::middleware(['auth', 'verified', 'role:innovation-transition'])->group(function () {
    Route::get('/innovation-transition/dashboard', [InnovationTransitionController::class, 'index'])
        ->name('dashboard.innovation-transition');
});

// Juridique
Route::middleware(['auth', 'verified', 'role:juridique'])->group(function () {
    Route::get('/juridique/dashboard', [JuridiqueController::class, 'index'])
        ->name('dashboard.juridique');
});


// Logistique & Généraux
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
    
    // Documents archives
    Route::get('/logistique-generaux/documents/archives', [LogistiqueGenerauxController::class, 'documentsArchive'])
        ->name('logistique-generaux.documents.archives');
    
    // Complementary documents
    Route::get('/logistique-generaux/documents/complementaires', [LogistiqueGenerauxController::class, 'complementaryDocuments'])
        ->name('logistique-generaux.documents.complementaires');
    Route::post('/logistique-generaux/documents/complementaires', [LogistiqueGenerauxController::class, 'storeComplementary'])
        ->name('logistique-generaux.documents.complementaires.store');
    Route::post('/logistique-generaux/documents/complementaires/{id}/renew', [LogistiqueGenerauxController::class, 'renewComplementary'])
        ->name('logistique-generaux.documents.complementaires.renew');
    
    // Complementary archives
    Route::get('/logistique-generaux/documents/complementaires/archives', [LogistiqueGenerauxController::class, 'archivedComplementaryDocuments'])
        ->name('logistique-generaux.documents.complementaires.archives');
});

    // Marchés & Marketing
    Route::middleware(['auth', 'verified', 'role:marches-marketing'])->group(function () {
    Route::get('/marches-marketing/dashboard', [MarchesMarketingController::class, 'index'])->name('dashboard.marches-marketing');
    Route::get('/marches-marketing/lettres/maintien', [MarchesMarketingController::class, 'lettresMaintien'])->name('lettres.maintien');
    Route::get('/marches-marketing/lettres/ecartement', [MarchesMarketingController::class, 'lettresEcartement'])->name('lettres.ecartement');
    Route::get('/marches-marketing/suivi', [MarchesMarketingController::class, 'suiviMarches'])->name('suivi.marches-marketing');
    Route::get('/marches-marketing/marches', [MarchesMarketingController::class, 'globalMarches'])->name('marches.marches-marketing');
    Route::get('/marches-marketing/portail', [MarchesMarketingController::class, 'portail'])->name('portail.marches-marketing');
    
    // Documentation
    Route::middleware(['auth', 'permission:module documentation'])
    ->group(function () {
        Route::get('/documents', [SharedController::class, 'documents'])
        ->name('documents.index');
    Route::post('/documents', [SharedController::class, 'storeDocument'])
        ->name('documents.store');
    Route::post('/documents/{id}/renew', [SharedController::class, 'renewDocument'])
        ->name('documents.renew');
    Route::get('/documents/archives', [SharedController::class, 'DocumentsArchive'])
        ->name('documents.archives');

    // Documents complémentaires
    Route::get('/documents-complementaires', [SharedController::class, 'complementaryDocuments'])
        ->name('documents.complementaires.index');
    Route::post('/documents-complementaires', [SharedController::class, 'storeComplementary'])
        ->name('documents.complementaires.store');
    Route::post('/documents-complementaires/{id}/renew', [SharedController::class, 'renewComplementary'])
        ->name('documents.complementaires.renew');
    Route::get('/documents-complementaires/archives', [SharedController::class, 'archivedComplementaryDocuments'])
        ->name('documents.complementaires.archives');
    });


    Route::get('/marches-marketing/traitementdossier', [MarchesMarketingController::class, 'traitementDossier'])->name('traitementdossier.marches-marketing');
    Route::get('/marches-marketing/traitementmarches', [MarchesMarketingController::class, 'traitementMarches'])->name('traitementmarches.marches-marketing');

    // Appels d'Offre
    Route::get('/marches-marketing/fetch-resultats-offres', [MarchesMarketingController::class, 'fetchResultatsOffres'])->name('marches-marketing.fetch-resultats-offres');
    Route::get('/marches-marketing/global-marches', [MarchesMarketingController::class, 'appelOfferPage'])->name('marches-marketing.global-marches');
    Route::get('/marches-marketing/appel-offers-data', [MarchesMarketingController::class, 'getAppelOffersData'])->name('marches-marketing.appel-offers-data');
    Route::get('/marches-marketing/check-available-imports', [MarchesMarketingController::class, 'checkAvailableImports'])->name('marches-marketing.check-available-imports');
    Route::post('/marches-marketing/import-scraped-data', [MarchesMarketingController::class, 'importScrapedData'])->name('marches-marketing.import-scraped-data');
    Route::get('/marches-marketing/list-dao-files', [MarchesMarketingController::class, 'listDaoFiles'])->name('marches-marketing.list-dao-files');
    Route::get('/marches-marketing/download-dao-file', [MarchesMarketingController::class, 'downloadDaoFile'])->name('marches-marketing.download-dao-file');



    Route::get('/marches-marketing/profils/demander', [MarchesMarketingController::class, 'demanderProfils'])
        ->name('marches.profils.demander');
    Route::post('/marches-marketing/profils/demander', [MarchesMarketingController::class, 'storeDemandeProfils'])
        ->name('marches.profils.store');





});

// Qualité & Audit
Route::middleware(['auth', 'verified', 'role:qualite-audit'])->group(function () {
    Route::get('/qualite-audit/dashboard', [QualiteAuditController::class, 'index'])
        ->name('dashboard.qualite-audit');
});



Route::middleware(['auth'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
});


// Ressources Humaines
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


    Route::get('/ressources-humaines/CNSSDocuments', [FournisseursTraitantsController::class, 'CNSSDocuments'])
        ->name('CNSSDocuments.ressources-humaines');

        
    Route::post('/ressources-humaines/projets', [RessourcesHumainesController::class, 'store'])
        ->name('ressources-humaines.projets.store');
    Route::put('/ressources-humaines/projets/{projet}', [RessourcesHumainesController::class, 'update'])
        ->name('ressources-humaines.projets.update');
    Route::delete('/ressources-humaines/projets/{projet}', [RessourcesHumainesController::class, 'destroy'])
        ->name('ressources-humaines.projets.destroy');

    // Routes CRUD pour les véhicules
    Route::post('/ressources-humaines/vehicules', [RessourcesHumainesController::class, 'storeVehicule'])
        ->name('ressources-humaines.vehicules.store');
    Route::put('/ressources-humaines/vehicules/{vehicule}', [RessourcesHumainesController::class, 'updateVehicule'])
        ->name('ressources-humaines.vehicules.update');
    Route::delete('/ressources-humaines/vehicules/{vehicule}', [RessourcesHumainesController::class, 'destroyVehicule'])
        ->name('ressources-humaines.vehicules.destroy');

    // Routes CRUD pour les progressions
    Route::post('/ressources-humaines/progressions', [RessourcesHumainesController::class, 'storeProgression'])
        ->name('ressources-humaines.progressions.store');
    Route::put('/ressources-humaines/progressions/{progression}', [RessourcesHumainesController::class, 'updateProgression'])
        ->name('ressources-humaines.progressions.update');
    Route::delete('/ressources-humaines/progressions/{progression}', [RessourcesHumainesController::class, 'destroyProgression'])
        ->name('ressources-humaines.progressions.destroy');

    Route::post('/ressources-humaines/materiels', [RessourcesHumainesController::class, 'storeMateriel'])
        ->name('ressources-humaines.materiels.store');
    Route::put('/ressources-humaines/materiels/{materiel}', [RessourcesHumainesController::class, 'updateMateriel'])
        ->name('ressources-humaines.materiels.update');
    Route::delete('/ressources-humaines/materiels/{materiel}', [RessourcesHumainesController::class, 'destroyMateriel'])
        ->name('ressources-humaines.materiels.destroy');

    // Access management routes
    Route::get('/ressources-humaines/access', [RessourcesHumainesController::class, 'access'])->name('ressources-humaines.access');
    Route::post('/ressources-humaines/access', [RessourcesHumainesController::class, 'storeAccess'])->name('ressources-humaines.access.store');
    Route::put('/ressources-humaines/access/{user}', [RessourcesHumainesController::class, 'updateAccess'])->name('ressources-humaines.access.update');
    Route::delete('/ressources-humaines/access/{user}', [RessourcesHumainesController::class, 'destroyAccess'])->name('ressources-humaines.access.destroy');
    Route::post('/ressources-humaines/access/{salarie}/affecter-projets', [RessourcesHumainesController::class, 'affecterProjets'])->name('ressources-humaines.access.affecter-projets');
    Route::post('/ressources-humaines/access/{salarie}/affecter-profil', [RessourcesHumainesController::class, 'affecterProfil'])->name('ressources-humaines.access.affecter-profil');
    Route::post('/ressources-humaines/access/profil/store', [RessourcesHumainesController::class, 'storeProfil'])->name('ressources-humaines.access.profil.store');


    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
        '/ressources-humaines/fetch-resultats-offres',
        [RessourcesHumainesController::class, 'fetchResultatsOffres']
    )->name('ressources-humaines.fetch-resultats-offres');

    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
        '/ressources-humaines/appel-offer',
        [RessourcesHumainesController::class, 'appelOfferPage']
    )->name('ressources-humaines.appel-offer');

    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
        '/ressources-humaines/appel-offers-data',
        [RessourcesHumainesController::class, 'getAppelOffersData']
    )->name('ressources-humaines.appel-offers-data');


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












    Route::get('/ressources-humaines/bons-commandes', [RessourcesHumainesController::class, 'getBonsCommandeData'])
        ->name('bons-commandes');
    
    // Launch Selenium script to fetch bons de commande (changed to POST for better AJAX handling)
    Route::post('/ressources-humaines/fetch-bons-commande', [RessourcesHumainesController::class, 'fetchBonsCommande'])
        ->name('fetch-bons-commande');
    
    // Import data from JSON to database
    Route::post('/ressources-humaines/import-bons-json', [RessourcesHumainesController::class, 'importBonsFromJson'])
        ->name('import-bons-json');
    
    // Check scraping status
    Route::get('/ressources-humaines/scraping-status', [RessourcesHumainesController::class, 'getScrapingStatus'])
        ->name('scraping-status');
    
    // DAO files management
    Route::get('/ressources-humaines/list-dao-files', [RessourcesHumainesController::class, 'listDaoFiles'])
        ->name('list-dao-files');
    
    Route::get('/ressources-humaines/download-dao-file', [RessourcesHumainesController::class, 'downloadDaoFile'])
        ->name('download-dao-file');









    
       // Lancer le script Selenium pour récupérer les marchés publics
    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
        '/ressources-humaines/fetch-marche-public',
        [RessourcesHumainesController::class, 'fetchMarchePublic']
    )->name('ressources-humaines.fetch-marche-public');

    // Obtenir les données JSON des marchés publics
    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
        '/ressources-humaines/marche-public',
        [RessourcesHumainesController::class, 'getMarchePublicData']
    )->name('ressources-humaines.marche-public');

    // Page marchés publics
    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->group(function () {
        Route::get(
            '/ressources-humaines/marche-public-page',
            [RessourcesHumainesController::class, 'marchePublicPage']
        )->name('ressources-humaines.marche-public-page');
    });

    // À ajouter dans les routes ressources-humaines
    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
        '/ressources-humaines/marches-publics-data',
        [RessourcesHumainesController::class, 'getMarchesPublicsData']
    )->name('ressources-humaines.marches-publics-data');

    });

Route::middleware(['auth', 'verified', 'role:ressources-humaines'])
    ->get('/ressources-humaines/download-file', function(Request $request) {
        $path = $request->get('path');
        $fullPath = storage_path('app/public/' . str_replace('/storage/', '', $path));
        
        if (file_exists($fullPath)) {
            return response()->download($fullPath); // Use download() instead of file()
        }
        
        abort(404);
    })->name('download.file');





























    Route::get('/ressources-humaines/MethodologyValidation', [RessourcesHumainesController::class, 'MethodologyValidation'])
        ->name('MethodologyValidation');
    
    Route::post('/ressources-humaines/methodologie/validate', [RessourcesHumainesController::class, 'validateMethodology'])
        ->name('methodologie.validate');
    
    Route::get('/ressources-humaines/methodologie/{document}/download', [RessourcesHumainesController::class, 'downloadMethodology'])
        ->name('methodologie.rh.download');
            Route::get('/quick-test', function () {
    // 1. Check RH users
    $rhUsersCount = \App\Models\User::role('ressources-humaines')->count();
    
    // 2. Check notifications table
    $notificationsCount = \Illuminate\Notifications\DatabaseNotification::count();
    
    // 3. Check if a document exists
    $documentExists = \App\Models\MethodologyDocument::exists();
    
    return [
        'rh_users_found' => $rhUsersCount,
        'total_notifications' => $notificationsCount,
        'documents_exist' => $documentExists,
        'queue_driver' => config('queue.default'),
    ];
});








    // References
        Route::get('/ressources-humaines/references', [RessourcesHumainesController::class, 'References'])
            ->name('references.index');
        
        // Show single reference details
        Route::get('/ressources-humaines/references/{id}', [RessourcesHumainesController::class, 'showReference'])
            ->name('references.show');
        
        // Validate or reject a reference
        Route::post('/ressources-humaines/references/{id}/validate', [RessourcesHumainesController::class, 'validateReference'])
            ->name('references.validate');
        
        // Download reference document
        Route::get('/ressources-humaines/references/{id}/download', [RessourcesHumainesController::class, 'downloadReferenceDocument'])
            ->name('references.download');






    // Other RH Pages
    Route::get('/ressources-humaines/CNSSDocuments', [RessourcesHumainesController::class, 'CNSSDocuments'])
        ->name('CNSSDocuments');
        
    Route::get('/ressources-humaines/ContractsDeclarations', [RessourcesHumainesController::class, 'ContractsDeclarations'])
        ->name('ContractsDeclarations');
        
    Route::get('/ressources-humaines/CVsDiplomas', [RessourcesHumainesController::class, 'CVsDiplomas'])
        ->name('CVsDiplomas');
        
    Route::get('/ressources-humaines/TeamValidation', [RessourcesHumainesController::class, 'TeamValidation'])
        ->name('TeamValidation');









    Route::get('/ressources-humaines/entretiens', [RessourcesHumainesController::class, 'indexEntretiens'])
        ->name('entretiens.index');
    
    // Page de création d'entretien
    Route::get('/ressources-humaines/entretiens/create', [RessourcesHumainesController::class, 'createEntretien'])
        ->name('entretiens.create');
    
    // Enregistrement d'un entretien
    Route::post('/ressources-humaines/entretiens', [RessourcesHumainesController::class, 'storeEntretien'])
        ->name('entretiens.store');
    
    // Détail d'un entretien
    Route::get('/ressources-humaines/entretiens/{entretien}', [RessourcesHumainesController::class, 'showEntretien'])
        ->name('entretiens.show');
    
    // Mise à jour d'un entretien
    Route::put('/ressources-humaines/entretiens/{entretien}', [RessourcesHumainesController::class, 'updateEntretien'])
        ->name('entretiens.update');
    
    // Suppression d'un entretien
    Route::delete('/ressources-humaines/entretiens/{entretien}', [RessourcesHumainesController::class, 'destroyEntretien'])
        ->name('entretiens.destroy');
    
    // Export PDF d'un entretien
    Route::get('/ressources-humaines/entretiens/{entretien}/export', [RessourcesHumainesController::class, 'exportEntretien'])
        ->name('entretiens.export');

    Route::get('/ressources-humaines/entretiens/{entretien}/download/{type}', [RessourcesHumainesController::class, 'downloadDocument'])
        ->name('entretiens.download');

    // Create this as a temporary route to check your database
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



    // View all demands
    Route::get('/ressources-humaines/profils/demandes', [RessourcesHumainesController::class, 'profilsDemandes'])
        ->name('rh.profils.demandes');
    
    // Update demand status
    Route::post('/ressources-humaines/profils/demandes/{demande}', [RessourcesHumainesController::class, 'updateStatutDemande'])
        ->name('rh.profils.demandes.update');
    
    // Search available profils
    Route::get('/ressources-humaines/profils/search', [RessourcesHumainesController::class, 'searchProfils'])
        ->name('rh.profils.search');
    
    // Assign profils to project
    Route::post('/ressources-humaines/profils/assign-to-project', [RessourcesHumainesController::class, 'assignToProject'])
        ->name('rh.profils.assign-to-project');












Route::middleware(['auth', 'verified', 'role:suivi-controle'])->group(function () {
    Route::get('/suivi-controle/dashboard', [SuiviControleController::class, 'index'])
        ->name('dashboard.suivi-controle');

    Route::get('/suivi-controle/terrains', [SuiviControleController::class, 'Terrains'])
        ->name('terrains.suivi-controle');
    
    Route::get('/suivi-controle/Planing', [SuiviControleController::class, 'Planing'])
        ->name('Planing.suivi-controle');

    Route::get('/suivi-controle/Tracking', [SuiviControleController::class, 'Tracking'])
        ->name('Planing.suivi-Tracking');


   

    Route::get('/suivi-controle/fetch-data', [SuiviControleController::class, 'fetchData']);
    Route::get('/suivi-controle/fetch-terrains', [SuiviControleController::class, 'fetchTerrains']);
    Route::get('/suivi-controle/fetch-salarie/{id}', [SuiviControleController::class, 'fetchSalarieData']);
    Route::post('/suivi-controle/terrain', [SuiviControleController::class, 'createTerrain']);
    Route::put('/suivi-controle/ProjetSals', [SuiviControleController::class, 'updateProjetSalaries']);
    Route::put('/suivi-controle/terrain/{id}', [SuiviControleController::class, 'editTerrain']);
    Route::put('/suivi-controle/notif/{id}', [SuiviControleController::class, 'deactivateNotif']);
    Route::delete('/suivi-controle/terrain/{id}', [SuiviControleController::class, 'deleteTerrain']);
    Route::post('/suivi-controle/terrain/affect-grant', [SuiviControleController::class, 'affectGrantSalarie']);
    Route::post('/suivi-controle/terrain/affect-grant-user', [SuiviControleController::class, 'affectGrantUser']);




    // In web.php or api.php
    Route::get('/suivi-controle/Planing', [SuiviControleController::class, 'planing']);
    Route::get('/suivi-controle/fetch-plans', [SuiviControleController::class, 'fetchPlans']);
    Route::post('/suivi-controle/plans', [SuiviControleController::class, 'storePlan']);
    Route::put('/suivi-controle/plans/{plan}', [SuiviControleController::class, 'updatePlan']);
    Route::delete('/suivi-controle/plans/{plan}', [SuiviControleController::class, 'destroyPlan']);
    Route::post('/suivi-controle/storeTask', [SuiviControleController::class, 'storeTask']);


    Route::get('/suivi-controle/fetch-all-data', [SuiviControleController::class, 'fetchAll']);
    Route::get('/suivi-controle/fetch-projet/{id}', [SuiviControleController::class, 'getProjetRessources']);
    
    Route::get('/suivi-controle/fetch-projetData/{id}', [SuiviControleController::class, 'getProjetStats']);
    Route::get('/suivi-controle/download-projetDoc/{id}', [SuiviControleController::class, 'getProjetDoc']);
    Route::put('/suivi-controle/approuve-projetDoc/{id}', [SuiviControleController::class, 'approuveProjetDoc']);
    Route::put('/suivi-controle/comment-projetDoc/{id}', [SuiviControleController::class, 'commentProjetDoc']);


    
}); 



// Salarie
Route::middleware(['auth', 'verified', 'role:salarie'])->group(function () {
    Route::get('/salarie/dashboard', [SalarieController::class, 'index'])
        ->name('dashboard.salarie');
});


Route::get('/dashboard', function () {
    $user = auth()->user();
    return match (true) {
        $user->hasRole('admin') => redirect()->route('dashboard.direction-generale'),
        $user->hasRole('marches-marketing') => redirect()->route('dashboard.marches-marketing'),
        $user->hasRole('direction-generale') => redirect()->route('dashboard.direction-generale'),
        $user->hasRole('communication-digitale') => redirect()->route('dashboard.communication-digitale'),
        $user->hasRole('etudes-techniques') => redirect()->route('dashboard.etudes-techniques'),
        $user->hasRole('fournisseurs-traitants') => redirect()->route('dashboard.fournisseurs-traitants'),
        $user->hasRole('innovation-transition') => redirect()->route('dashboard.innovation-transition'),
        $user->hasRole('juridique') => redirect()->route('dashboard.juridique'),
        $user->hasRole('logistique-generaux') => redirect()->route('dashboard.logistique-generaux'),
        $user->hasRole('qualite-audit') => redirect()->route('dashboard.qualite-audit'),
        $user->hasRole('ressources-humaines') => redirect()->route('dashboard.ressources-humaines'),
        $user->hasRole('suivi-controle') => redirect()->route('dashboard.suivi-controle'),
        $user->hasRole('salarie') => redirect()->route('dashboard.salarie'),

        default => redirect('/'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// ===== ROUTES SCREENSHOTS =====

// Routes API pour la capture de screenshots (tous les services autorisés)
Route::middleware(['auth'])->group(function () {
    Route::post('/api/screenshots', [ScreenshotController::class, 'store'])
        ->name('api.screenshots.store');
    Route::delete('/api/screenshots/{screenshot}', [ScreenshotController::class, 'deleteOwn'])
        ->name('api.screenshots.destroy');
});

// Routes pour visualiser et télécharger les screenshots (utilisateurs autorisés + RH + Direction Générale)
Route::middleware(['auth'])->group(function () {
    Route::get('/screenshots/view/{id}', [ScreenshotController::class, 'viewById'])
        ->name('screenshots.view')
        ->where('id', '[0-9]+');
    Route::get('/screenshots/download/{id}', [ScreenshotController::class, 'downloadById'])
        ->name('screenshots.download')
        ->where('id', '[0-9]+');
    Route::get('/storage/screenshots/{path}', [ScreenshotController::class, 'serveStorage'])
        ->where('path', '.*')
        ->name('storage.screenshots');
});

// Routes d'administration des screenshots (Direction Générale + RH uniquement)
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/screenshots/data', [ScreenshotController::class, 'adminIndex'])
        ->name('admin.screenshots.data')
        ->middleware('role:admin|ressources-humaines');
    Route::get('/admin/screenshots/stats', [ScreenshotController::class, 'adminStats'])
        ->name('admin.screenshots.stats')
        ->middleware('role:admin|ressources-humaines');
    Route::get('/admin/screenshots/users', [ScreenshotController::class, 'getUsers'])
        ->name('admin.screenshots.users')
        ->middleware('role:admin|ressources-humaines');
    Route::get('/admin/screenshots', [ScreenshotController::class, 'adminView'])
        ->name('admin.screenshots')
        ->middleware('role:admin|ressources-humaines');
    Route::get('/admin/screenshots/{screenshot}/details', [ScreenshotController::class, 'show'])
        ->name('admin.screenshots.show')
        ->middleware('role:admin|ressources-humaines');
    Route::delete('/admin/screenshots/{screenshot}', [ScreenshotController::class, 'destroy'])
        ->name('admin.screenshots.destroy')
        ->middleware('role:admin|ressources-humaines');
});



Broadcast::routes(['middleware' => ['auth:web']]);


Route::get('/test-pusher', function () {
    $notif = Notification::create([
        'user_id' => auth()->id() ?? 7,
        'source_user_id' => auth()->id() ?? 7,
        'titre' => 'Test Pusher',
        'commentaire' => 'Ceci est un test temps réel',
        'type' => 'remplir_champs',
    ]);

    event(new NewNotification($notif));

    return 'Notification envoyée !';
});




// Broadcast::routes();



// Route::get('/test-broadcast', function () {
//     $data = [
//         'id' => 7,
//         'titre' => 'TEST DIRECT',
//         'commentaire' => 'Ça vient de /test-broadcast',
//         'created_at' => now()->toDateTimeString(),
//     ];

//     // Log pour vérifier que ça passe
//     Log::info('Broadcasting NewNotification event', $data);

//     broadcast(new NewNotification((object) $data));

//     return 'Event broadcasted';
// });






// Add these routes to your routes/web.php for debugging

Route::prefix('debug')->middleware('auth')->group(function () {
    
    // Test 1: Check if RH users exist - FIXED
    Route::get('/check-rh-users', function () {
        try {
            // Using Spatie's role() method
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

    // Test 2: Check all users and their roles
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

    // Test 3: Check notifications table
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

    // Test 4: Manually trigger notification - FIXED
    Route::get('/test-notification', function () {
        try {
            // Using Spatie's role() method
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

            // Send notification
            $rhUser->notify(new \App\Notifications\MethodologyDocumentNotification(
                $document,
                'submitted',
                'Test notification from debug route'
            ));

            // Check if notification was created
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

    // Test 5: Test the full upload flow - FIXED
    Route::get('/test-upload-flow', function () {
        try {
            $currentUser = auth()->user();
            
            // Using Spatie's role() method
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

            // Create a fake document
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

            // Try to notify each RH user
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

            // Clean up - delete test document
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

    // Test 6: Check user's notifications
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

    // Test 7: Quick test everything
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

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
