<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
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
//         $user->hasRole('financier-comptabilite') => redirect()->route('dashboard.financier-comptabilite'),
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




require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
