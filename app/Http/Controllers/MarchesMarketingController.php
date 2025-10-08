<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

// App Models
use App\Models\AppelOffer;
use App\Models\BonCommande;
use App\Models\Formation;
use App\Models\Projet;
use App\Models\ProjetMp;
use App\Models\ProjetNv;
use App\Models\ResultatBonCommande;
use App\Models\Salarie;
use App\Models\SousTrait;
use App\Models\DemandeProfil;
use App\Models\Profil;
use App\Models\User;
use App\Models\DemandeProfilDetail;
use App\Notifications\NouvelleDemandeProfils;


use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;

 // Third-Party & PHP Core
use Carbon\Carbon;
use League\Csv\Reader;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;
use ZipArchive;

class MarchesMarketingController extends Controller
{

    public function index()
    {
        return Inertia::render('marches-marketing/Dashboard');

    }
    public function lettresMaintien()
    {
        return Inertia::render('marches-marketing/lettres/Maintien');
    }

    public function lettresEcartement()
    {
        return Inertia::render('marches-marketing/lettres/Ecartement');
    }

    public function suiviMarches()
    {
        return Inertia::render('marches-marketing/Suivi');
    }
    
    public function globalMarches()
    {
        return Inertia::render('marches-marketing/Marches');
    }
    public function portail()
    {
        return Inertia::render('marches-marketing/Portail');
    }
    
    public function documentation()
    {
        return Inertia::render('marches-marketing/Documentation');
    }

    public function traitementDossier()
    {
        return Inertia::render('marches-marketing/Traitementdossier');
    }
    
    public function traitementMarches()
    {
        return Inertia::render('marches-marketing/Traitementmarches');
    }




    public function getAppelOffersData()
    {
        $appelOffers = AppelOffer::orderBy('date_ouverture', 'desc')->get();
        return response()->json($appelOffers);
    }

    /**
     * Check if there are new scraped results available for import
     */
    public function checkAvailableImports()
    {
        $jsonPath = storage_path('app/public/global-marches/global-marches.json');
        
        if (!file_exists($jsonPath)) {
            return response()->json([
                'available' => false,
                'message' => 'Aucun fichier de résultats trouvé'
            ]);
        }

        // Check if user already imported this file
        $fileModified = filemtime($jsonPath);
        $lastImportedTime = Session::get('last_imported_time', 0);
        
        if ($fileModified <= $lastImportedTime) {
            return response()->json([
                'available' => false,
                'message' => 'Aucune nouvelle donnée à importer'
            ]);
        }

        try {
            $jsonData = json_decode(file_get_contents($jsonPath), true);
            
            return response()->json([
                'available' => true,
                'count' => count($jsonData ?? []),
                'lastModified' => date('d/m/Y H:i:s', $fileModified),
                'preview' => array_slice($jsonData ?? [], 0, 5), // Preview first 5 records
                'fileTimestamp' => $fileModified
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'available' => false,
                'message' => 'Erreur lors de la lecture du fichier: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Import the scraped data from JSON to database
     */
    public function importScrapedData()
    {
        $jsonPath = storage_path('app/public/global-marches/global-marches.json');
        
        if (!file_exists($jsonPath)) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier JSON non trouvé'
            ], 404);
        }

        try {
            $jsonData = json_decode(file_get_contents($jsonPath), true);
            
            if (!$jsonData || !is_array($jsonData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fichier JSON invalide ou vide'
                ], 400);
            }

            $importedCount = 0;
            $updatedCount = 0;
            $errors = [];

            foreach ($jsonData as $index => $record) {
                try {
                    $result = $this->importSingleRecord($record);
                    if ($result['created']) {
                        $importedCount++;
                    } else {
                        $updatedCount++;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Enregistrement $index: " . $e->getMessage();
                    Log::error("Import error for record $index", [
                        'record' => $record,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Mark this import time to prevent showing popup again
            Session::put('last_imported_time', time());

            // Archive the imported file
            $archivePath = storage_path('app/public/global-marches/archives');
            if (!is_dir($archivePath)) {
                mkdir($archivePath, 0755, true);
            }
            
            $archiveFile = $archivePath . '/global-marches_' . date('Y-m-d_H-i-s') . '.json';
            copy($jsonPath, $archiveFile);

            return response()->json([
                'success' => true,
                'message' => "Import terminé avec succès",
                'stats' => [
                    'imported' => $importedCount,
                    'updated' => $updatedCount,
                    'total' => count($jsonData),
                    'errors' => count($errors)
                ],
                'errors' => array_slice($errors, 0, 5) // Show only first 5 errors
            ]);

        } catch (\Exception $e) {
            Log::error("Import failed", ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'import: ' . $e->getMessage()
            ], 500);
        }
    }


    public function getFilterOptions()
    {
        try {
            $appelOffers = AppelOffer::select([
                'maitre_ouvrage', 'ville', 'adjudicataire', 
                'date_ouverture', 'date_adjudications', 'date_affichage'
            ])->get();

            // Get unique values for filters
            $maitresOuvrage = $appelOffers->pluck('maitre_ouvrage')
                ->filter()->unique()->sort()->values();
            
            $villes = $appelOffers->pluck('ville')
                ->filter()->unique()->sort()->values();
            
            $adjudicataires = $appelOffers->pluck('adjudicataire')
                ->filter()->unique()->sort()->values();

            // Get date ranges
            $dateRanges = [
                'ouverture' => [
                    'min' => $appelOffers->whereNotNull('date_ouverture')->min('date_ouverture'),
                    'max' => $appelOffers->whereNotNull('date_ouverture')->max('date_ouverture')
                ],
                'adjudication' => [
                    'min' => $appelOffers->whereNotNull('date_adjudications')->min('date_adjudications'),
                    'max' => $appelOffers->whereNotNull('date_adjudications')->max('date_adjudications')
                ],
                'affichage' => [
                    'min' => $appelOffers->whereNotNull('date_affichage')->min('date_affichage'),
                    'max' => $appelOffers->whereNotNull('date_affichage')->max('date_affichage')
                ]
            ];

            return response()->json([
                'maitresOuvrage' => $maitresOuvrage,
                'villes' => $villes,
                'adjudicataires' => $adjudicataires,
                'dateRanges' => $dateRanges
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des options de filtre'
            ], 500);
        }
    }


    private function parseDate(?string $dateString): ?\Carbon\Carbon
{
    if (empty($dateString)) {
        return null;
    }

    try {
        // Format français DD/MM/YYYY
        if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dateString)) {
            return \Carbon\Carbon::createFromFormat('d/m/Y', $dateString);
        }
        
        // Autres formats possibles
        return \Carbon\Carbon::parse($dateString);
    } catch (\Exception $e) {
        Log::warning('Impossible de parser la date', ['date' => $dateString, 'error' => $e->getMessage()]);
        return null;
    }
}


    /**
     * Import a single record to database
     */
    private function importSingleRecord(array $record): array
    {
        // Map JSON fields to database fields
        $reference = $this->cleanValue($record['Référence'] ?? null);
        $maitre_ouvrage = $this->cleanValue($record["Maitre d'ouvrage"] ?? null);
        $objet = $this->cleanValue($record['Objet'] ?? null);
        $adjudicataire = $this->cleanValue($record['Adjudicataire'] ?? null);
        $ville = $this->cleanValue($record['Ville'] ?? null);
        $budget = $this->cleanValue($record['Budget(DHs)'] ?? null);
        $montant = $this->cleanValue($record['Montant(DHs)'] ?? null);
        $date_adjudications = $this->cleanValue($record['Date des adjudications'] ?? null);
        $date_ouverture = $this->cleanValue($record["Date d'ouverture"] ?? null);
        $date_affichage = $this->cleanValue($record["Date d'affichage"] ?? null);
        $lien_dao = $this->cleanValue($record['Lien_DAO'] ?? null);
        $lien_pv = $this->cleanValue($record['Lien_PV'] ?? null);
        $dao = $this->cleanValue($record['D.A.O'] ?? null);
        $pv = $this->cleanValue($record['PV'] ?? null);

        // Get extracted files
        $chemin_fichiers = $record['EXTRACTED_FILES'] ?? [];

        // Parse dates
        $parsed_date_ouverture = $this->parseDate($date_ouverture);
        $parsed_date_adjudications = $this->parseDate($date_adjudications);
        $parsed_date_affichage = $this->parseDate($date_affichage);

        // Skip if essential data is missing
        if (empty($reference) && empty($objet) && empty($maitre_ouvrage)) {
            throw new \Exception("Données essentielles manquantes");
        }

        // Create or update record
        $appelOffer = AppelOffer::updateOrCreate(
            [
                'reference' => $reference,
                'objet' => $objet,
                'maitre_ouvrage' => $maitre_ouvrage,
            ],
            [
                'pv' => $pv,
                'date_ouverture' => $parsed_date_ouverture,
                'budget' => $budget,
                'lien_dao' => $lien_dao,
                'lien_pv' => $lien_pv,
                'dao' => $dao,
                'date_adjudications' => $parsed_date_adjudications,
                'ville' => $ville,
                'montant' => $montant,
                'adjudicataire' => $adjudicataire,
                'chemin_fichiers' => $chemin_fichiers,
                'date_affichage' => $parsed_date_affichage,
            ]
        );

        return [
            'created' => $appelOffer->wasRecentlyCreated,
            'id' => $appelOffer->id
        ];
    }

    /**
     * Run the scraping script only (no database import)
     */
    public function fetchResultatsOffres()
    {
        // Use absolute path for Windows
        $pythonScript = base_path('selenium_scripts\\global_marches.py');
        
        // Lock to prevent multiple executions
        $lock = Cache::lock('selenium_global_marches_lock', 600);
        if (!$lock->get()) {
            return response()->json([
                'success' => false,
                'message' => 'Une exécution Selenium est déjà en cours, réessayez dans quelques minutes.'
            ], 423);
        }

        try {
            // Execute Python script synchronously
            $command = "python \"$pythonScript\"";
            $output = [];
            $returnCode = 0;
            
            Log::info("Executing Python script: $command");
            exec($command . " 2>&1", $output, $returnCode);
            
            if ($returnCode !== 0) {
                Log::error("Python script failed with return code: $returnCode", [
                    'output' => $output,
                    'command' => $command
                ]);
                throw new \Exception("Le script Python a échoué avec le code: $returnCode");
            }

            Log::info("Python script completed successfully", ['output' => $output]);

            // Check if files were created
            $jsonPath = storage_path('app/public/global-marches/global-marches.json');
            if (!file_exists($jsonPath)) {
                throw new \Exception("Fichier JSON non créé après exécution du script");
            }

            // Get count of scraped records
            $jsonData = json_decode(file_get_contents($jsonPath), true);
            $recordCount = count($jsonData ?? []);

            // Clear any previous import session to allow new popup
            Session::forget('last_imported_time');

            return response()->json([
                'success' => true,
                'message' => "Scraping terminé avec succès. $recordCount enregistrements trouvés.",
                'recordCount' => $recordCount,
                'hasNewData' => true
            ]);

        } catch (\Exception $e) {
            Log::error("Error in fetchResultatsOffres: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du scraping : ' . $e->getMessage()
            ], 500);
        } finally {
            $lock->release();
        }
    }

    private function cleanValue(?string $value): ?string
    {
        if (is_null($value) || trim($value) === '' || trim($value) === '---') {
            return null;
        }
        return trim($value);
    }

    // private function parseDate(?string $dateString): ?Carbon
    // {
    //     if (empty($dateString)) {
    //         return null;
    //     }

    //     try {
    //         $formats = ['d/m/Y', 'Y-m-d', 'd-m-Y', 'm/d/Y'];
            
    //         foreach ($formats as $format) {
    //             try {
    //                 return Carbon::createFromFormat($format, $dateString);
    //             } catch (\Exception $e) {
    //                 continue;
    //             }
    //         }
            
    //         return Carbon::parse($dateString);
            
    //     } catch (\Exception $e) {
    //         Log::warning("Failed to parse date: $dateString", ['error' => $e->getMessage()]);
    //         return null;
    //     }
    // }

    public function appelOfferPage()
    {
        return Inertia::render('marches-marketing/GlobalMarches');
    }

    



####################################################################################################
####################################################################################################
####################################################################################################
####################################################################################################
####################################################################################################






    public function demanderProfils()
    {
        $categories = [
            'profils_techniques_fondamentaux' => 'Profils Techniques Fondamentaux',
            'profils_specialises_techniques' => 'Profils Spécialisés Techniques',
            'profils_conception_avancee' => 'Profils Conception Avancée',
            'profils_management_encadrement' => 'Profils Management et Encadrement',
            'profils_controle_qualite' => 'Profils Contrôle et Qualité',
            'profils_expertise_specialisee' => 'Profils Expertise Spécialisée',
            'profils_digital_innovation' => 'Profils Digital et Innovation',
            'profils_support_administratifs' => 'Profils Support et Administratifs',
            'profils_commerciaux_techniques' => 'Profils Commerciaux Techniques',
            'profils_rd_innovation' => 'Profils R&D et Innovation',
        ];

        $postes = [
            'ingenieur_structure_beton_arme' => 'Ingénieur Structure Béton Armé',
            'ingenieur_structures_metalliques' => 'Ingénieur Structures Métalliques',
            'technicien_bureau_etudes' => 'Technicien Bureau d\'Études',
            'dessinateur_projeteur' => 'Dessinateur-Projeteur',
            'ingenieur_geotechnicien' => 'Ingénieur Géotechnicien',
            'ingenieur_vrd' => 'Ingénieur VRD',
            'technicien_geotechnique' => 'Technicien Géotechnique',
            'coordinateur_bim' => 'Coordinateur BIM',
            'modeleur_bim' => 'Modeleur BIM',
            'bim_manager' => 'BIM Manager',
            'chef_projet_etudes' => 'Chef de Projet Études',
            'responsable_bureau_etudes' => 'Responsable Bureau d\'Études',
            'ingenieur_methodes' => 'Ingénieur Méthodes',
            'controleur_technique' => 'Contrôleur Technique',
            'coordinateur_sps' => 'Coordinateur SPS',
            'expert_rehabilitation' => 'Expert en Réhabilitation',
            'specialiste_hqe' => 'Spécialiste HQE',
            'ingenieur_facades' => 'Ingénieur Façades',
            'ingenieur_computational_design' => 'Ingénieur Computational Design',
            'specialiste_digital_twin' => 'Spécialiste Digital Twin',
            'assistant_technique' => 'Assistant(e) Technique',
            'gestionnaire_projets' => 'Gestionnaire de Projets',
            'ingenieur_affaires' => 'Ingénieur d\'Affaires',
            'responsable_marches_publics' => 'Responsable Marchés Publics',
            'ingenieur_recherche_developpement' => 'Ingénieur Recherche et Développement',
            'responsable_innovation' => 'Responsable Innovation',
        ];

        $demandes = DemandeProfil::with(['details', 'traitePar'])
            ->where('demandeur_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('marches-marketing/DemanderProfils', [
            'categories' => $categories,
            'postes' => $postes,
            'demandes' => $demandes,
        ]);
    }

    public function storeDemandeProfils(Request $request)
    {
        $validated = $request->validate([
            'titre_demande' => 'required|string|max:255',
            'description' => 'nullable|string',
            'urgence' => 'required|in:normale,urgent,critique',
            'date_souhaitee' => 'nullable|date',
            'profils' => 'required|array|min:1',
            'profils.*.categorie_profil' => 'required|string',
            'profils.*.poste_profil' => 'required|string',
            'profils.*.quantite' => 'required|integer|min:1',
            'profils.*.niveau_experience' => 'required|in:junior,intermediaire,senior,expert',
            'profils.*.competences_requises' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            // Créer la demande
            $demande = DemandeProfil::create([
                'demandeur_id' => auth()->id(),
                'titre_demande' => $validated['titre_demande'],
                'description' => $validated['description'] ?? null,
                'urgence' => $validated['urgence'],
                'date_souhaitee' => $validated['date_souhaitee'] ?? null,
                'statut' => 'en_attente',
            ]);

            // Créer les détails et vérifier la disponibilité
            foreach ($validated['profils'] as $profil) {
                $profilsDisponibles = Profil::where('categorie_profil', $profil['categorie_profil'])
                    ->where('poste_profil', $profil['poste_profil'])
                    ->where('niveau_experience', $profil['niveau_experience'])
                    ->where('actif', true)
                    ->count();

                DemandeProfilDetail::create([
                    'demande_id' => $demande->id,
                    'categorie_profil' => $profil['categorie_profil'],
                    'poste_profil' => $profil['poste_profil'],
                    'quantite' => $profil['quantite'],
                    'niveau_experience' => $profil['niveau_experience'],
                    'competences_requises' => $profil['competences_requises'] ?? null,
                    'disponible' => $profilsDisponibles >= $profil['quantite'],
                    'profils_disponibles' => $profilsDisponibles,
                ]);
            }

            // Notifier tous les utilisateurs RH
            $usersRH = User::role('ressources-humaines')->get();
            foreach ($usersRH as $userRH) {
                $userRH->notify(new NouvelleDemandeProfils($demande));
            }

            DB::commit();

            return redirect()->back()->with('success', 'Demande de profils envoyée avec succès');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de l\'envoi de la demande: ' . $e->getMessage());
        }
    }
}


