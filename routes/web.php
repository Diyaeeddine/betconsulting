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

// Direction Générale (Admin)
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/direction-generale/dashboard', [DirectionGeneraleController::class, 'index'])
        ->name('dashboard.direction-generale');
    Route::get('/direction-generale/tracking', [DirectionGeneraleController::class, 'tracking'])
        ->name('direction-generale.tracking');
    Route::get('/direction-generale/gestion-personnel', [DirectionGeneraleController::class, 'gestionPersonnel'])
        ->name('direction-generale.gestion-personnel');
    Route::get('/direction-generale/budget', [DirectionGeneraleController::class, 'budget'])
        ->name('direction-generale.budget');
    Route::get('/direction-generale/vue-globale', [DirectionGeneraleController::class, 'vueGlobale'])
        ->name('direction-generale.vue-globale');
    Route::get('/direction-generale/rapports-strategiques', [DirectionGeneraleController::class, 'rapportsStrategiques'])
        ->name('direction-generale.rapports-strategiques');
});

// Marchés & Marketing
Route::middleware(['auth', 'verified', 'role:marches-marketing'])->group(function () {
    Route::get('/marches-marketing/dashboard', [MarchesMarketingController::class, 'index'])
        ->name('dashboard.marches-marketing');
    Route::get('/marches-marketing/tracking', [MarchesMarketingController::class, 'tracking'])
        ->name('marches-marketing.tracking');
    Route::get('/marches-marketing/gestion-personnel', [MarchesMarketingController::class, 'gestionPersonnel'])
        ->name('marches-marketing.gestion-personnel');
    Route::get('/marches-marketing/budget', [MarchesMarketingController::class, 'budget'])
        ->name('marches-marketing.budget');
    Route::get('/marches-marketing/campagnes', [MarchesMarketingController::class, 'campagnes'])
        ->name('marches-marketing.campagnes');
    Route::get('/marches-marketing/analyse-marche', [MarchesMarketingController::class, 'analyseMarche'])
        ->name('marches-marketing.analyse-marche');
});

// Financier & Comptabilité
Route::middleware(['auth', 'verified', 'role:financier-comptabilite'])->group(function () {
    Route::get('/financier-comptabilite/dashboard', [FinancierComptabiliteController::class, 'index'])
        ->name('dashboard.financier-comptabilite');
    Route::get('/financier-comptabilite/tracking', [FinancierComptabiliteController::class, 'tracking'])
        ->name('financier-comptabilite.tracking');
    Route::get('/financier-comptabilite/gestion-personnel', [FinancierComptabiliteController::class, 'gestionPersonnel'])
        ->name('financier-comptabilite.gestion-personnel');
    Route::get('/financier-comptabilite/budget', [FinancierComptabiliteController::class, 'budget'])
        ->name('financier-comptabilite.budget');
    Route::get('/financier-comptabilite/rapports-financiers', [FinancierComptabiliteController::class, 'rapportsFinanciers'])
        ->name('financier-comptabilite.rapports-financiers');
});

// Études Techniques
Route::middleware(['auth', 'verified', 'role:etudes-techniques'])->group(function () {
    Route::get('/etudes-techniques/dashboard', [EtudesTechniquesController::class, 'index'])
        ->name('dashboard.etudes-techniques');
    Route::get('/etudes-techniques/tracking', [EtudesTechniquesController::class, 'tracking'])
        ->name('etudes-techniques.tracking');
    Route::get('/etudes-techniques/gestion-personnel', [EtudesTechniquesController::class, 'gestionPersonnel'])
        ->name('etudes-techniques.gestion-personnel');
    Route::get('/etudes-techniques/budget', [EtudesTechniquesController::class, 'budget'])
        ->name('etudes-techniques.budget');
    Route::get('/etudes-techniques/projets-techniques', [EtudesTechniquesController::class, 'projetsTechniques'])
        ->name('etudes-techniques.projets-techniques');
    Route::get('/etudes-techniques/rapports-techniques', [EtudesTechniquesController::class, 'rapportsTechniques'])
        ->name('etudes-techniques.rapports-techniques');
    Route::get('/etudes-techniques/suivi-projets', [EtudesTechniquesController::class, 'suiviProjets'])
        ->name('etudes-techniques.suivi-projets');
});

// Qualité & Audit
Route::middleware(['auth', 'verified', 'role:qualite-audit'])->group(function () {
    Route::get('/qualite-audit/dashboard', [QualiteAuditController::class, 'index'])
        ->name('dashboard.qualite-audit');
    Route::get('/qualite-audit/tracking', [QualiteAuditController::class, 'tracking'])
        ->name('qualite-audit.tracking');
    Route::get('/qualite-audit/gestion-personnel', [QualiteAuditController::class, 'gestionPersonnel'])
        ->name('qualite-audit.gestion-personnel');
    Route::get('/qualite-audit/budget', [QualiteAuditController::class, 'budget'])
        ->name('qualite-audit.budget');
    Route::get('/qualite-audit/controles-qualite', [QualiteAuditController::class, 'controlesQualite'])
        ->name('qualite-audit.controles-qualite');
    Route::get('/qualite-audit/audits', [QualiteAuditController::class, 'audits'])
        ->name('qualite-audit.audits');
    Route::get('/qualite-audit/non-conformites', [QualiteAuditController::class, 'nonConformites'])
        ->name('qualite-audit.non-conformites');
});

// Innovation & Transition
Route::middleware(['auth', 'verified', 'role:innovation-transition'])->group(function () {
    Route::get('/innovation-transition/dashboard', [InnovationTransitionController::class, 'index'])
        ->name('dashboard.innovation-transition');
    Route::get('/innovation-transition/tracking', [InnovationTransitionController::class, 'tracking'])
        ->name('innovation-transition.tracking');
    Route::get('/innovation-transition/gestion-personnel', [InnovationTransitionController::class, 'gestionPersonnel'])
        ->name('innovation-transition.gestion-personnel');
    Route::get('/innovation-transition/budget', [InnovationTransitionController::class, 'budget'])
        ->name('innovation-transition.budget');
    Route::get('/innovation-transition/projets-innovants', [InnovationTransitionController::class, 'projetsInnovants'])
        ->name('innovation-transition.projets-innovants');
    Route::get('/innovation-transition/transition-ecologique', [InnovationTransitionController::class, 'transitionEcologique'])
        ->name('innovation-transition.transition-ecologique');
});

// Logistique & Généraux
Route::middleware(['auth', 'verified', 'role:logistique-generaux'])->group(function () {
    Route::get('/logistique-generaux/dashboard', [LogistiqueGenerauxController::class, 'index'])
        ->name('dashboard.logistique-generaux');
    Route::get('/logistique-generaux/tracking', [LogistiqueGenerauxController::class, 'tracking'])
        ->name('logistique-generaux.tracking');
    Route::get('/logistique-generaux/gestion-personnel', [LogistiqueGenerauxController::class, 'gestionPersonnel'])
        ->name('logistique-generaux.gestion-personnel');
    Route::get('/logistique-generaux/budget', [LogistiqueGenerauxController::class, 'budget'])
        ->name('logistique-generaux.budget');
    Route::get('/logistique-generaux/gestion-stocks', [LogistiqueGenerauxController::class, 'gestionStocks'])
        ->name('logistique-generaux.gestion-stocks');
    Route::get('/logistique-generaux/moyens-generaux', [LogistiqueGenerauxController::class, 'moyensGeneraux'])
        ->name('logistique-generaux.moyens-generaux');
});

// Communication Digitale
Route::middleware(['auth', 'verified', 'role:communication-digitale'])->group(function () {
    Route::get('/communication-digitale/dashboard', [CommunicationDigitaleController::class, 'index'])
        ->name('dashboard.communication-digitale');
    Route::get('/communication-digitale/tracking', [CommunicationDigitaleController::class, 'tracking'])
        ->name('communication-digitale.tracking');
    Route::get('/communication-digitale/gestion-personnel', [CommunicationDigitaleController::class, 'gestionPersonnel'])
        ->name('communication-digitale.gestion-personnel');
    Route::get('/communication-digitale/budget', [CommunicationDigitaleController::class, 'budget'])
        ->name('communication-digitale.budget');
    Route::get('/communication-digitale/reseaux-sociaux', [CommunicationDigitaleController::class, 'reseauxSociaux'])
        ->name('communication-digitale.reseaux-sociaux');
    Route::get('/communication-digitale/campagnes-digitales', [CommunicationDigitaleController::class, 'campagnesDigitales'])
        ->name('communication-digitale.campagnes-digitales');
});

// Juridique
Route::middleware(['auth', 'verified', 'role:juridique'])->group(function () {
    Route::get('/juridique/dashboard', [JuridiqueController::class, 'index'])
        ->name('dashboard.juridique');
    Route::get('/juridique/tracking', [JuridiqueController::class, 'tracking'])
        ->name('juridique.tracking');
    Route::get('/juridique/gestion-personnel', [JuridiqueController::class, 'gestionPersonnel'])
        ->name('juridique.gestion-personnel');
    Route::get('/juridique/budget', [JuridiqueController::class, 'budget'])
        ->name('juridique.budget');
    Route::get('/juridique/contrats', [JuridiqueController::class, 'contrats'])
        ->name('juridique.contrats');
    Route::get('/juridique/contentieux', [JuridiqueController::class, 'contentieux'])
        ->name('juridique.contentieux');
});

// Fournisseurs & Traitants
Route::middleware(['auth', 'verified', 'role:fournisseurs-traitants'])->group(function () {
    Route::get('/fournisseurs-traitants/dashboard', [FournisseursTraitantsController::class, 'index'])
        ->name('dashboard.fournisseurs-traitants');
    Route::get('/fournisseurs-traitants/tracking', [FournisseursTraitantsController::class, 'tracking'])
        ->name('fournisseurs-traitants.tracking');
    Route::get('/fournisseurs-traitants/gestion-personnel', [FournisseursTraitantsController::class, 'gestionPersonnel'])
        ->name('fournisseurs-traitants.gestion-personnel');
    Route::get('/fournisseurs-traitants/budget', [FournisseursTraitantsController::class, 'budget'])
        ->name('fournisseurs-traitants.budget');
    Route::get('/fournisseurs-traitants/gestion-fournisseurs', [FournisseursTraitantsController::class, 'gestionFournisseurs'])
        ->name('fournisseurs-traitants.gestion-fournisseurs');
    Route::get('/fournisseurs-traitants/suivi-commandes', [FournisseursTraitantsController::class, 'suiviCommandes'])
        ->name('fournisseurs-traitants.suivi-commandes');
});

// Ressources Humaines
Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->group(function () {
    Route::get('/ressources-humaines/dashboard', [RessourcesHumainesController::class, 'index'])
        ->name('dashboard.ressources-humaines');
    Route::get('/ressources-humaines/tracking', [RessourcesHumainesController::class, 'tracking'])
        ->name('ressources-humaines.tracking');
    Route::get('/ressources-humaines/gestion-personnel', [RessourcesHumainesController::class, 'gestionPersonnel'])
        ->name('ressources-humaines.gestion-personnel');
    Route::get('/ressources-humaines/budget', [RessourcesHumainesController::class, 'budget'])
        ->name('ressources-humaines.budget');
});

// Suivi & Contrôle
Route::middleware(['auth', 'verified', 'role:suivi-controle'])->group(function () {
    Route::get('/suivi-controle/dashboard', [SuiviControleController::class, 'index'])
        ->name('dashboard.suivi-controle');
    Route::get('/suivi-controle/tracking', [SuiviControleController::class, 'tracking'])
        ->name('suivi-controle.tracking');
    Route::get('/suivi-controle/gestion-personnel', [SuiviControleController::class, 'gestionPersonnel'])
        ->name('suivi-controle.gestion-personnel');
    Route::get('/suivi-controle/budget', [SuiviControleController::class, 'budget'])
        ->name('suivi-controle.budget');
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
