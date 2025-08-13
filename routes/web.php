<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DirectionGeneraleController;
use App\Http\Controllers\CommunicationDigitaleController;
use App\Http\Controllers\EtudesTechniquesController;
use App\Http\Controllers\FinancierComptabiliteController;
use App\Http\Controllers\FournisseursTraitantsController;
use App\Http\Controllers\JuridiqueController;
use App\Http\Controllers\LogistiqueGenerauxController;
use App\Http\Controllers\MarchesMarketingController;
use App\Http\Controllers\QualiteAuditController;
use App\Http\Controllers\RessourcesHumainesController;
use App\Http\Controllers\SuiviControleController;
use App\Http\Controllers\ScreenshotController;
use App\Http\Controllers\InnovationTransitionController;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('dashboard', [
        'auth' => [
            'user' => auth()->user(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/direction-generale/dashboard', [DirectionGeneraleController::class, 'index'])
        ->name('dashboard.direction-generale');
});

Route::middleware(['auth', 'verified', 'role:communication-digitale'])->group(function () {
    Route::get('/communication-digitale/dashboard', [CommunicationDigitaleController::class, 'index'])
        ->name('dashboard.communication-digitale');
});

Route::middleware(['auth', 'verified', 'role:etudes-techniques'])->group(function () {
    Route::get('/etudes-techniques/dashboard', [EtudesTechniquesController::class, 'index'])
        ->name('dashboard.etudes-techniques');
});

Route::middleware(['auth', 'verified', 'role:financier-comptabilite'])->group(function () {
    Route::get('/financier-comptabilite/dashboard', [FinancierComptabiliteController::class, 'index'])
        ->name('dashboard.financier-comptabilite');
});

Route::middleware(['auth', 'verified', 'role:fournisseurs-traitants'])->group(function () {
    Route::get('/fournisseurs-traitants/dashboard', [FournisseursTraitantsController::class, 'index'])
        ->name('dashboard.fournisseurs-traitants');
});

// Dans routes/web.php - section Innovation & Transition
Route::middleware(['auth', 'verified', 'role:innovation-transition'])->group(function () {
    Route::get('/innovation-transition/dashboard', [InnovationTransitionController::class, 'dashboard'])
        ->name('dashboard.innovation-transition');

    // Routes tickets CRUD complet
    Route::get('/innovation-transition/tickets', [InnovationTransitionController::class, 'tickets'])
        ->name('innovation.tickets');
    Route::post('/innovation-transition/tickets', [InnovationTransitionController::class, 'storeTicket'])
        ->name('innovation.tickets.store');
    Route::put('/innovation-transition/tickets/{id}', [InnovationTransitionController::class, 'updateTicket'])
        ->name('innovation.tickets.update');
    Route::delete('/innovation-transition/tickets/{id}', [InnovationTransitionController::class, 'destroyTicket'])
        ->name('innovation.tickets.destroy');
});

Route::middleware(['auth', 'verified', 'role:juridique'])->group(function () {
    Route::get('/juridique/dashboard', [JuridiqueController::class, 'index'])
        ->name('dashboard.juridique');
});

Route::middleware(['auth', 'verified', 'role:logistique-generaux'])->group(function () {
    Route::get('/logistique-generaux/dashboard', [LogistiqueGenerauxController::class, 'index'])
        ->name('dashboard.logistique-generaux');
});

Route::middleware(['auth', 'verified', 'role:marches-marketing'])->group(function () {
    Route::get('/marches-marketing/dashboard', [MarchesMarketingController::class, 'index'])
        ->name('dashboard.marches-marketing');
});

Route::middleware(['auth', 'verified', 'role:qualite-audit'])->group(function () {
    Route::get('/qualite-audit/dashboard', [QualiteAuditController::class, 'index'])
        ->name('dashboard.qualite-audit');
});

Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->group(function () {
    Route::get('/ressources-humaines/dashboard', [RessourcesHumainesController::class, 'index'])
        ->name('dashboard.ressources-humaines');
    Route::get('/ressources-humaines/projects', [RessourcesHumainesController::class, 'menuProjects'])
        ->name('ressources-humaines.projects');
    Route::get('/ressources-humaines/maps', [RessourcesHumainesController::class, 'Maps'])
        ->name('maps.ressources-humaines');
    Route::get('/ressources-humaines/users', [RessourcesHumainesController::class, 'Users'])
        ->name('users.ressources-humaines');
});

Route::middleware(['auth', 'verified', 'role:suivi-controle'])->group(function () {
    Route::get('/suivi-controle/dashboard', [SuiviControleController::class, 'index'])
        ->name('dashboard.suivi-controle');
});

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

Route::middleware(['auth'])->group(function () {
    Route::post('/api/screenshots', [ScreenshotController::class, 'store'])
        ->name('api.screenshots.store');
    Route::delete('/api/screenshots/{screenshot}', [ScreenshotController::class, 'deleteOwn'])
        ->name('api.screenshots.destroy');
});

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

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
