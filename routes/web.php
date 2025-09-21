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
use App\Http\Controllers\QualiteAuditController;
use App\Http\Controllers\RessourcesHumainesController;
use App\Http\Controllers\SuiviControleController;
use App\Http\Controllers\ScreenshotController;
use Illuminate\Http\Request;
//use ZipArchive;

Route::get('/', function () {
    return redirect()->route('login');
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
});

// Qualité & Audit
Route::middleware(['auth', 'verified', 'role:qualite-audit'])->group(function () {
    Route::get('/qualite-audit/dashboard', [QualiteAuditController::class, 'index'])
        ->name('dashboard.qualite-audit');
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


// Suivi & Contrôle
Route::middleware(['auth', 'verified', 'role:suivi-controle'])->group(function () {
    Route::get('/suivi-controle/dashboard', [SuiviControleController::class, 'index'])
        ->name('dashboard.suivi-controle');
});

// Route::get('/dashboard', function () {
//     $user = auth()->user();
//     return match (true) {
//         $user->hasRole('admin') => redirect()->route('dashboard.direction-generale'),
//         $user->hasRole('marches-marketing') => redirect()->route('dashboard.marches-marketing'),
//         $user->hasRole('direction-generale') => redirect()->route('dashboard.direction-generale'),
//         $user->hasRole('communication-digitale') => redirect()->route('dashboard.communication-digitale'),
//         $user->hasRole('etudes-techniques') => redirect()->route('dashboard.etudes-techniques'),
//         $user->hasRole('fournisseurs-traitants') => redirect()->route('dashboard.fournisseurs-traitants'),
//         $user->hasRole('innovation-transition') => redirect()->route('dashboard.innovation-transition'),
//         $user->hasRole('juridique') => redirect()->route('dashboard.juridique'),
//         $user->hasRole('logistique-generaux') => redirect()->route('dashboard.logistique-generaux'),
//         $user->hasRole('qualite-audit') => redirect()->route('dashboard.qualite-audit'),
//         $user->hasRole('ressources-humaines') => redirect()->route('dashboard.ressources-humaines'),
//         $user->hasRole('suivi-controle') => redirect()->route('dashboard.suivi-controle'),
//         default => redirect('/'),
//     };
// })->middleware(['auth', 'verified'])->name('dashboard');

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

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
