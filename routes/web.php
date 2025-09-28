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
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Hash;
use App\Models\Salarie;

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


    Route::get('/ressources-humaines/sousTrais', [RessourcesHumainesController::class, 'SousTrais'])
        ->name('SousTraitants.ressources-humaines');


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


    Route::get('/ressources-humaines/users', [RessourcesHumainesController::class, 'Users'])
        ->name('users.ressources-humaines');
    Route::get('/users/projets', [RessourcesHumainesController::class, 'getProjects'])->name('user.projects.ressources-humaines');
    Route::get('/users/{user}', [RessourcesHumainesController::class, 'getUser'])->name('user.show.ressources-humaines');
    Route::post('/users', [RessourcesHumainesController::class, 'storeUsers'])->name('user.store.ressources-humaines');
    // Route::post('/usersDisp', [RessourcesHumainesController::class, 'storeSalarieDisponibility'])->name('user.storeDisp.ressources-humaines');
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

    // Proxy pour télécharger les fichiers ZIP externes (contourne CORS)
    Route::get('/ressources-humaines/proxy-download', function (\Illuminate\Http\Request $request) {
        $url = $request->query('url');
        if (!$url) {
            return response('URL manquante', 400);
        }

        try {
            $response = Http::get($url);

            if ($response->failed()) {
                return response('Erreur lors du téléchargement du fichier distant', 500);
            }

            return response($response->body(), 200)
                ->header('Content-Type', 'application/zip')
                ->header('Content-Disposition', 'attachment; filename="download.zip"')
                ->header('Access-Control-Allow-Origin', '*'); // pour CORS
        } catch (\Exception $e) {
            return response('Erreur: ' . $e->getMessage(), 500);
        }
    })->name('ressources-humaines.proxy-download');

    //soustrait 
    Route::get('/sousTrais', [RessourcesHumainesController::class, 'getSousTrais'])->name('sousTrais.get.ressources-humaines');
    Route::post('/sousTrais', [RessourcesHumainesController::class, 'storeSousTrais'])->name('sousTrais.store.ressources-humaines');
    Route::delete('/sousTrais/{id}', [RessourcesHumainesController::class, 'deleteSousTrais'])->name('sousTrais.delete.ressources-humaines');

});


Route::middleware(['auth', 'verified', 'role:suivi-controle'])->group(function () {
    Route::get('/suivi-controle/dashboard', [SuiviControleController::class, 'index'])
        ->name('dashboard.suivi-controle');

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


   

    Route::get('/suivi-controle/fetch-data', [SuiviControleController::class, 'fetchData']);
    Route::get('/suivi-controle/fetch-terrains', [SuiviControleController::class, 'fetchTerrains']);
    Route::get('/suivi-controle/fetch-salarie/{id}', [SuiviControleController::class, 'fetchSalarieData']);
    Route::post('/suivi-controle/terrain', [SuiviControleController::class, 'createTerrain']);
    Route::put('/suivi-controle/ProjetSals', [SuiviControleController::class, 'updateProjetSalaries']);
    
    Route::put('/suivi-controle/terrain/{id}', [SuiviControleController::class, 'editTerrain']);
    Route::put('/suivi-controle/notif/{id}', [SuiviControleController::class, 'deactivateNotif']);
    Route::delete('/suivi-controle/terrain/{id}', [SuiviControleController::class, 'deleteTerrain']);
    Route::post('/suivi-controle/terrain/affect-grant', [SuiviControleController::class, 'affectGrantSalarie']);
    Route::post('/suivi-controle/docReqEntry', [SuiviControleController::class, 'storeDocRequis']);

    Route::get('/suivi-controle/fetch-plans', [SuiviControleController::class, 'fetchDataPlanings']);
    Route::post('/suivi-controle/plans', [SuiviControleController::class, 'createPlan']);
    Route::post('/suivi-controle/storeTask', [SuiviControleController::class, 'storeTask']);
    Route::put('/suivi-controle/plans/{id}', [SuiviControleController::class, 'updatePlan']);
    Route::delete('/suivi-controle/plans/{id}', [SuiviControleController::class, 'deletePlan']);

    Route::post('/suivi-controle/chat', [SuiviControleController::class, 'sendChat']);
    

    Route::get('/suivi-controle/fetch-all-data', [SuiviControleController::class, 'fetchAll']);
    Route::get('/suivi-controle/fetch-projet/{id}', [SuiviControleController::class, 'getProjetRessources']);
    
    Route::get('/suivi-controle/fetch-projetData/{id}', [SuiviControleController::class, 'getProjetStats']);
    Route::get('/suivi-controle/download-projetDoc/{id}', [SuiviControleController::class, 'getProjetDoc']);
    Route::put('/suivi-controle/approuve-projetDoc/{id}', [SuiviControleController::class, 'approuveProjetDoc']);
    Route::put('/suivi-controle/comment-projetDoc/{id}', [SuiviControleController::class, 'commentProjetDoc']);
   


}); 


Route::middleware('auth.basic')->group(function () {
    Route::get('/suivi-controle/fetch-plans', [SuiviControleController::class, 'fetchDataPlanings']);

    Route::get('/suivi-controle/fetch-projetData/{id}', [SuiviControleController::class, 'getProjetStats']);


});


Route::post('/broadcasting/auth', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'channel_name' => 'required|string',
        'socket_id' => 'required|string',
    ]);

    $user = Salarie::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // Validate that the user is allowed to join this channel
    preg_match('/salarie\.(\d+)/', $request->channel_name, $matches);
    $channelSalarieId = $matches[1] ?? null;

    if ((int)$user->id !== (int)$channelSalarieId || $user->emplacement !== 'terrain') {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    // Simulate "logged in" user for broadcast
    return Broadcast::auth($request->merge(['user_id' => $user->id]));
});


// Route::middleware('auth.basic')->group(function () {
//     Route::get('/suivi-controle/fetch-planss', [SuiviControleController::class, 'fetchDataPlanings']);
// });


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
