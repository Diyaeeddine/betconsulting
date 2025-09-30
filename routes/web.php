<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\DirectionGeneraleController;
use App\Http\Controllers\CommunicationDigitaleController;
use App\Http\Controllers\EtudesTechniquesController;
use App\Http\Controllers\FinancierComptabiliteController;
use App\Http\Controllers\FournisseursTraitantsController;
use App\Http\Controllers\InnovationTransitionController;
use App\Http\Controllers\JuridiqueController;
use App\Http\Controllers\LogistiqueGenerauxController;
use App\Http\Controllers\MarchesMarketingController;
use App\Http\Controllers\SharedController;
use App\Http\Controllers\QualiteAuditController;
use App\Http\Controllers\RessourcesHumainesController;
use App\Http\Controllers\SuiviControleController;
use App\Http\Controllers\SalarieController;
use App\Http\Controllers\ScreenshotController;
use App\Events\NewNotification;
use App\Models\User;
use App\Models\Document;
use App\Models\MarchePublic;
use App\Notifications\DocumentExpirationNotification;
use App\Models\Notification;
use Spatie\Permission\Models\Role;
use App\Notifications\MarcheDecisionNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Auth\SalarieAuthController;

use Illuminate\Http\Request;
//use ZipArchive;

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
        Route::get('/direction-generale/boite-decision-profile', [DirectionGeneraleController::class, 'profileDecision'])
        ->name('direction-generale.boiteDecisionProfile');
    Route::post('/direction-generale/profile-decision/{salarie}', [DirectionGeneraleController::class, 'handleProfileDecision'])
    ->name('direction-generale.handleProfileDecision');
    // Routes pour les actions sur les marchés
    Route::post('/direction-generale/marche/{id}/accepter', [DirectionGeneraleController::class, 'accepterMarche'])
        ->name('direction-generale.accepter-marche');
    
    Route::post('/direction-generale/marche/{id}/refuser', [DirectionGeneraleController::class, 'refuserMarche'])
        ->name('direction-generale.refuser-marche');
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

// Fournisseurs & Traitants
Route::middleware(['auth', 'verified', 'role:fournisseurs-traitants'])->group(function () {
    Route::get('/fournisseurs-traitants/dashboard', [FournisseursTraitantsController::class, 'index'])
        ->name('dashboard.fournisseurs-traitants');
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
});

// Marchés & Marketing
Route::middleware(['auth', 'verified', 'role:marches-marketing'])->group(function () {
    Route::get('/marches-marketing/dashboard', [MarchesMarketingController::class, 'index'])
        ->name('dashboard.marches-marketing');

    Route::get('/marches-marketing/marches', [MarchesMarketingController::class, 'marches'])
        ->name('marches.marches-marketing');

    // Nouvelle route pour afficher un projet
    Route::get('/marches-marketing/marches/{projet}', [MarchesMarketingController::class, 'show'])
        ->name('marches.projet.show');

    Route::get('/marches-marketing/utilisateurs', [MarchesMarketingController::class, 'users'])
        ->name('users.marches-marketing');
      
    // Routes gestion dossiers
    Route::get('/marches-marketing/{marche}/dossiers', [SharedController::class, 'afficherDossiers'])
        ->name('marches.dossiers');

    Route::post('/marches-marketing/dossiers/{dossier}/taches', [SharedController::class, 'creerTache'])
        ->name('dossiers.taches.create');

    Route::post('/marches-marketing/taches/{tache}/upload', [SharedController::class, 'uploadFichiers'])
        ->name('taches.upload');

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
// Dans web.php
Route::get('/debug/marche/{marche}', function($marcheId) {
    $marche = MarchePublic::with('dossiers.taches')->findOrFail($marcheId);
    
    return response()->json([
        'marche_id' => $marche->id,
        'nombre_dossiers' => $marche->dossiers->count(),
        'dossiers' => $marche->dossiers->map(function($d) {
            return [
                'id' => $d->id,
                'nom' => $d->nom_dossier,
                'type' => $d->type_dossier,
                'nombre_taches' => $d->taches->count(),
                'taches' => $d->taches->map(function($t) {
                    return [
                        'id' => $t->id,
                        'nom' => $t->nom_tache,
                        'statut' => $t->statut
                    ];
                })
            ];
        })
    ]);
});
});

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

Route::middleware(['auth','permission:module marche public','permission:module marche global','permission:les marches'])

->group(function () {
    
    Route::get('marches-publics', [SharedController::class, 'marchesPublic'])->name('marchesPublic');
    Route::get('global-marches', [SharedController::class, 'GlobalMarches'])->name('GlobalMarches');
    Route::get('marches/aos-selectionnes', [SharedController::class, 'aosSelectionnes'])->name('aosSelectionnes');

    Route::post('marches/{id}/accept', [SharedController::class, 'acceptMP'])->name('marchesPublic.accept');
    Route::post('marches/{id}/select', [SharedController::class, 'selectMP'])->name('marchesPublic.select');
    Route::post('marches/{id}/reject', [SharedController::class, 'rejectMP'])->name('marchesPublic.reject');

    Route::post('marches/{id}/accept-initial', [SharedController::class, 'acceptIMP'])->name('marchesPublic.acceptInitial');
    Route::post('marches/{id}/annule', [SharedController::class, 'annulerMP'])->name('marchesPublic.annulerMP');

});
Route::middleware(['auth','permission:les marches'])

->group(function () {

    Route::get('marches/encours', [SharedController::class, 'marchesEnCours'])->name('marches.encours');
    Route::get('marches/annulee', [SharedController::class, 'marchesAnnulee'])->name('marches.annulee');
    Route::get('marches/rejetee', [SharedController::class, 'marchesRejetee'])->name('marches.rejetee');
    Route::get('marches/terminee', [SharedController::class, 'marchesTerminee'])->name('marches.terminee');


    });



// Qualité & Audit
Route::middleware(['auth', 'verified', 'role:qualite-audit'])->group(function () {
    Route::get('/qualite-audit/dashboard', [QualiteAuditController::class, 'index'])
        ->name('dashboard.qualite-audit');
});

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

    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
        '/ressources-humaines/fetch-projets-direct',
        [RessourcesHumainesController::class, 'fetchProjetsDirect']
    )->name('ressources-humaines.fetch-projets-direct');

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

    // Lancer le script Selenium pour récupérer les bons de commande
    Route::get('/ressources-humaines/fetch-bons-commande', [RessourcesHumainesController::class, 'fetchBonsCommande'])
        ->name('ressources-humaines.fetch-bons-commande');

    // Obtenir les données JSON des bons de commande
    Route::get('/ressources-humaines/bons-commandes', [RessourcesHumainesController::class, 'getBonsCommandeData'])
        ->name('ressources-humaines.bons-commandes');





    Route::get('/ressources-humaines/sousTrais', [RessourcesHumainesController::class, 'SousTrais'])
        ->name('SousTraitants.ressources-humaines');

    Route::get('/ressources-humaines/projets-data', [RessourcesHumainesController::class, 'getProjetsData'])
        ->name('ressources-humaines.projets-data');



    // Routes CRUD pour les projets
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

    Route::get('/ressources-humaines/maps', [RessourcesHumainesController::class, 'Maps'])
        ->name('maps.ressources-humaines');

    Route::get('/ressources-humaines/projets-csv', [RessourcesHumainesController::class, 'getProjetsCsv'])->name('ressources-humaines.projets-csv');

    Route::get('/ressources-humaines/users', [RessourcesHumainesController::class, 'Users'])
        ->name('users.ressources-humaines');
    Route::get('/users/projets', [RessourcesHumainesController::class, 'getProjects'])->name('user.projects.ressources-humaines');
    Route::get('/users/{user}', [RessourcesHumainesController::class, 'getUser'])->name('user.show.ressources-humaines');
    Route::post('/users', [RessourcesHumainesController::class, 'storeUsers'])->name('user.store.ressources-humaines');
    Route::put('/users/{salarie}', [RessourcesHumainesController::class, 'enableDisableUser'])->name('user.update.ressources-humaines');
    Route::put('/userPass/{salarie}', [RessourcesHumainesController::class, 'updateUserPass'])->name('user.updatePass.ressources-humaines');
    Route::put('/userProjet/{salarie}', [RessourcesHumainesController::class, 'affecteGrantUser'])->name('user.updateProject.ressources-humaines');

    // Routes CRUD pour les formations
    Route::post('/ressources-humaines/formations', [RessourcesHumainesController::class, 'storeFormation'])
        ->name('ressources-humaines.formations.store');
    Route::put('/ressources-humaines/formations/{formation}', [RessourcesHumainesController::class, 'updateFormation'])
        ->name('ressources-humaines.formations.update');
    Route::delete('/ressources-humaines/formations/{formation}', [RessourcesHumainesController::class, 'destroyFormation'])
        ->name('ressources-humaines.formations.destroy');

    //zip



    Route::get('/ressources-humaines/list-dao-files', function (Request $request) {
        $zipUrl = $request->query('zipPath');
        if (!$zipUrl) return response()->json([], 400);

        // Télécharger le ZIP temporairement
        $tempZip = tempnam(sys_get_temp_dir(), 'dao');
        file_put_contents($tempZip, file_get_contents($zipUrl));

        $zip = new ZipArchive();
        $files = [];

        if ($zip->open($tempZip) === true) {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $files[] = [
                    'name' => $zip->getNameIndex($i),
                    'path' => $zip->getNameIndex($i), // utilisé pour l'ouverture
                ];
            }
            $zip->close();
        }

        unlink($tempZip); // supprimer fichier temporaire

        return response()->json($files);
    });


    Route::get('/ressources-humaines/download-dao-file', function (Request $request) {
        $zipUrl = $request->query('zipPath');
        $filePath = $request->query('filePath');
        if (!$zipUrl || !$filePath) return response('Paramètre manquant', 400);

        $tempZip = tempnam(sys_get_temp_dir(), 'dao');
        file_put_contents($tempZip, file_get_contents($zipUrl));

        $zip = new ZipArchive();
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

    // Lancer le script Selenium pour récupérer les résultats des bons de commande (ResultatBonCommande)
    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
        '/ressources-humaines/fetch-resultats-bon-commande',
        [RessourcesHumainesController::class, 'fetchResultatsBonCommande']
    )->name('ressources-humaines.fetch-resultats-bon-commande');

    // Obtenir les données JSON des ResultatBonCommande
    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
        '/ressources-humaines/resultats-bon-commande',
        [RessourcesHumainesController::class, 'getResultatsBonCommandeData']
    )->name('ressources-humaines.resultats-bon-commande');

    Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->group(function () {
        Route::get(
            '/ressources-humaines/resultats-bon-commande-page',
            [RessourcesHumainesController::class, 'resultatsBonCommandePage']
        )->name('ressources-humaines.resultats-bon-commande-page');
    });

    //soustrait 
    Route::get('/sousTrais', [RessourcesHumainesController::class, 'getSousTrais'])->name('sousTrais.get.ressources-humaines');
    Route::post('/sousTrais', [RessourcesHumainesController::class, 'storeSousTrais'])->name('sousTrais.store.ressources-humaines');
});

// Suivi & Contrôle
Route::middleware(['auth', 'verified', 'role:suivi-controle'])->group(function () {
    Route::get('/suivi-controle/dashboard', [SuiviControleController::class, 'index'])
        ->name('dashboard.suivi-controle');
});



// Salarie
Route::middleware(['auth', 'verified', 'role:salarie'])->group(function () {
    Route::get('/salarie/dashboard', [SuiviControleController::class, 'index'])
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

    // 1️⃣ Créer la notification dans la DB
    $user->notify(new DocumentExpirationNotification($document, 5));

    // 2️⃣ Récupérer la dernière notification créée
    $latestNotification = $user->notifications()->latest()->first();

    // 3️⃣ Envoyer l'event immédiatement à Pusher
    event(new NewNotification($latestNotification, $user->id));

    return response()->json([
        'success' => true,
        'message' => 'Notification envoyée pour le document: ' . $document->type,
        'user_id' => $user->id,
        'document_id' => $document->id,
        'channel' => 'private-user.' . $user->id
    ]);
});

Route::prefix('salarie')->name('salarie.')->group(function () {
    Route::middleware('guest:salarie')->group(function () {
        Route::get('login', [SalarieAuthController::class, 'showLoginForm'])
            ->name('login');
        Route::post('/login', [SalarieAuthController::class, 'login']);
    });

    Route::middleware('auth:salarie')->group(function () {
        Route::post('/logout', [SalarieAuthController::class, 'logout'])
            ->name('logout');
        
        // Dashboard et autres pages
        Route::get('/dashboard', function () {
            return inertia('Salarie/Dashboard', [
                'salarie' => Auth::guard('salarie')->user()
            ]);
        })->name('dashboard');

        // Vos autres routes salariés ici
    });
});

// Broadcast::routes();



// Route::get('/test-broadcast', function () {
//     $data = [
//         'id' => 7,
//         'titre' => 'TEST DIRECT',
//         'commentaire' => 'Ça vient de /test-broadcast',
//         'created_at' => now()->toDateTimeString(),
//     ];


//     broadcast(new NewNotification((object) $data));

//     return 'Event broadcasted';
// });


Route::get('/test-notification-admin', function () {
    try {
        Log::info("Test de notification admin démarré");
        
        // Créer un marché fictif pour le test (ou utiliser un existant)
        $marche = MarchePublic::first(); // Prendre le premier marché
        
        if (!$marche) {
            // Si pas de marché, en créer un temporaire
            $marche = new MarchePublic();
            $marche->id = 999; // ID fictif
            $marche->title = "Test Marché AO";
            $marche->objet = "Test pour notification admin";
            $marche->etape = "decision admin";
            $marche->is_accepted = true;
        }
        
        // Simuler l'utilisateur qui accepte (utilisateur connecté)
        $userWhoAccepted = auth()->user();
        
        if (!$userWhoAccepted) {
            return response()->json([
                'error' => 'Vous devez être connecté pour tester'
            ], 401);
        }
        
        // Trouver tous les admins
        $adminRole = Role::where('name', 'admin')->first();
        
        if (!$adminRole) {
            return response()->json([
                'error' => 'Rôle admin non trouvé'
            ], 404);
        }
        
        $admins = $adminRole->users;
        
        if ($admins->isEmpty()) {
            return response()->json([
                'error' => 'Aucun admin trouvé'
            ], 404);
        }
        
        // Envoyer la notification à tous les admins
        $notificationsSent = 0;
        foreach ($admins as $admin) {
            $admin->notify(new MarcheDecisionNotification($marche, $userWhoAccepted, $admin->id));
            $notificationsSent++;
            
            Log::info("Notification test envoyée à l'admin", [
                'admin_id' => $admin->id,
                'admin_email' => $admin->email
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => "Notification de test envoyée à {$notificationsSent} admin(s)",
            'admins_notified' => $admins->pluck('email'),
            'marche_test' => $marche->title ?? $marche->objet ?? 'Marché test',
            'sent_by' => $userWhoAccepted->name
        ]);
        
    } catch (Exception $e) {
        Log::error("Erreur lors du test de notification admin", [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => 'Erreur lors du test: ' . $e->getMessage()
        ], 500);
    }
})->middleware(['web', 'auth']);


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
