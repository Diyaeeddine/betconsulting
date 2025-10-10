<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
// App Models
use App\Notifications\ReferenceRejectedNotification;


use App\Models\AppelOffer;
use App\Models\BonCommande;
use App\Models\Formation;
use App\Models\Materiel;
use App\Models\Profil;
use App\Models\Progression;
use App\Models\Projet;
use App\Models\ProjetMp;
use App\Models\Notification;
use App\Models\ProjetNv;
use App\Models\ResultatBonCommande;
use App\Models\Salarie;
use App\Models\Reference;
use App\Models\Entretien;
use App\Models\DemandeProfil;
use App\Models\ImportedDocument;
use App\Models\User;
use App\Models\Vehicule;
use App\Models\SousTrait;
use App\Models\DocsRequis;

 // Laravel Facades & Illuminate
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

use App\Models\MethodologyDocument;
 // Third-Party & PHP Core
use Carbon\Carbon;
use League\Csv\Reader;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;
use ZipArchive;
use Barryvdh\DomPDF\Facade\Pdf;

use Inertia\Inertia;

use App\Notifications\MethodologyDocumentNotification;
use App\Events\NewNotification;
use Illuminate\Notifications\DatabaseNotification;
use App\Notifications\ReferenceValidatedNotification;






class RessourcesHumainesController extends Controller
{
    public function index()
    {
        $projets = Projet::with('responsable')->get();
        $users = User::all(['id', 'name']);

        return Inertia::render('ressources-humaines/Dashboard', [
            'projets' => $projets,
            'users' => $users
        ]);
    }

    public function tracking()
    {
        $projetsFromDB = Projet::with(['responsable', 'salaries'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        $dynamicTrackingPoints = $projetsFromDB->map(function($projet, $index) {
            return [
                'id' => $projet->id,
                'title' => $projet->nom,
                'address' => $projet->lieu_realisation ?? 'Adresse non spécifiée',
                'position' => [
                    'lat' => (float)$projet->latitude,
                    'lng' => (float)$projet->longitude
                ],
                'status' => $this->convertStatus($projet->statut),
                'distance' => rand(15, 50) . 'km', 
                'estimatedTime' => $this->getEstimatedTime($projet),
                'projectManager' => [
                    'name' => $projet->responsable->name ?? 'Non assigné',
                    'phone' => '+212 6 12 34 56 78', 
                ],
                'currentVehicle' => $this->generateVehicleInfo(),
                'vehicles' => $this->generateVehiclesList(),
                'employees' => $projet->salaries->map(function($salarie) {
                    return [
                        'name' => trim($salarie->nom . ' ' . $salarie->prenom),
                        'role' => $salarie->fonction ?? 'Employé'
                    ];
                })->toArray(),
                'fuel' => [
                    'current' => rand(40, 90),
                    'estimatedTime' => rand(1, 4) . 'h ' . rand(10, 59) . 'min',
                ],
                'timeline' => $this->generateTimeline($projet)
            ];
        });

        return Inertia::render('ressources-humaines/Tracking', [
            'dynamicTrackingPoints' => $dynamicTrackingPoints
        ]);
    }

    private function convertStatus($status)
    {
        $statusMap = [
            'en_cours' => 'execution',
            'termine' => 'completed',
            'en_attente' => 'preparation'
        ];
        
        return $statusMap[$status] ?? 'preparation';
    }

    private function getEstimatedTime($projet)
    {
        if ($projet->date_debut && $projet->date_fin) {
            $debut = new \DateTime($projet->date_debut);
            $fin = new \DateTime($projet->date_fin);
            $diff = $debut->diff($fin);
            
            if ($diff->days > 30) {
                return ceil($diff->days / 30) . ' mois';
            } else if ($diff->days > 7) {
                return ceil($diff->days / 7) . ' semaines';
            } else {
                return $diff->days . ' jours';
            }
        }
        
        $durations = ['1 semaine', '2 semaines', '3 semaines', '1 mois', '2 mois'];
        return $durations[array_rand($durations)];
    }

    private function generateVehicleInfo()
    {
        $vehicles = [
            [
                'type' => 'truck',
                'name' => 'Camion Mercedes',
                'loadPercentage' => rand(30, 90),
                'capacity' => '2000 Kg',
                'currentLoad' => rand(500, 1800) . ' Kg'
            ],
            [
                'type' => 'car',
                'name' => 'Toyota Hilux',
                'loadPercentage' => rand(20, 70),
                'capacity' => '500 Kg',
                'currentLoad' => rand(100, 450) . ' Kg'
            ],
            [
                'type' => 'machinery',
                'name' => 'Caterpillar 320',
                'loadPercentage' => rand(50, 100),
                'capacity' => 'Excavatrice',
                'currentLoad' => 'En service'
            ]
        ];

        return $vehicles[array_rand($vehicles)];
    }

    private function generateVehiclesList()
    {
        return [
            ['type' => 'Camion', 'count' => rand(1, 3), 'status' => 'active', 'model' => 'Mercedes Actros', 'capacity' => '2000 Kg'],
            ['type' => 'Voiture', 'count' => rand(1, 2), 'status' => 'active', 'model' => 'Toyota Hilux', 'capacity' => '500 Kg'],
            ['type' => 'Engin', 'count' => rand(0, 2), 'status' => 'active', 'model' => 'Caterpillar 320', 'capacity' => 'N/A'],
        ];
    }

    private function generateTimeline($projet)
    {
        $currentStatus = $this->convertStatus($projet->statut);
        
        $timeline = [
            [
                'status' => 'Programmation',
                'time' => $projet->date_debut ? date('d M, H:i', strtotime($projet->date_debut)) : 'Non défini',
                'description' => 'Projet planifié et ressources allouées.',
                'completed' => true,
                'delay' => null,
            ],
            [
                'status' => 'Confirmation',
                'time' => $projet->date_debut ? date('d M, H:i', strtotime($projet->date_debut . ' +2 hours')) : 'Non défini',
                'description' => 'Projet confirmé, équipe assignée.',
                'completed' => true,
                'delay' => null,
            ],
            [
                'status' => 'Préparation',
                'time' => $projet->date_debut ? date('d M, H:i', strtotime($projet->date_debut . ' +1 day')) : 'Non défini',
                'description' => 'Matériaux et équipements préparés.',
                'completed' => in_array($currentStatus, ['execution', 'completed']),
                'current' => $currentStatus === 'preparation',
                'delay' => null,
            ],
            [
                'status' => 'En Route',
                'time' => 'En cours',
                'description' => 'Équipe en déplacement vers le site.',
                'completed' => in_array($currentStatus, ['execution', 'completed']),
                'current' => $currentStatus === 'en-route',
                'delay' => null,
            ],
            [
                'status' => 'Exécution',
                'time' => $currentStatus === 'execution' ? 'Maintenant' : 'Planifié',
                'description' => 'Travaux en cours d\'exécution.',
                'completed' => $currentStatus === 'completed',
                'current' => $currentStatus === 'execution',
                'delay' => $currentStatus === 'execution' ? (rand(0, 1) ? rand(10, 60) . 'min en retard' : null) : null,
            ],
            [
                'status' => 'Clôture',
                'time' => $projet->date_fin ? date('d M, H:i', strtotime($projet->date_fin)) : 'À planifier',
                'description' => 'Rapport final et archivage.',
                'completed' => $currentStatus === 'completed',
                'delay' => null,
            ],
        ];

        return $timeline;
    }

    

    public function projets()
    {
        $projets = Projet::with('responsable')->orderBy('created_at', 'desc')->get();
        $users = User::orderBy('name')->get();

        return Inertia::render('ressources-humaines/Projets', [
            'projets' => $projets,
            'users' => $users,
        ]);
    }





    public function progressions()
    {
        $progressions = Progression::with(['projet', 'validePar' => function($query) {
            $query->select('id', 'name');
        }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($progression) {

                $progression->valide_par_user = $progression->validePar;
                return $progression;
            });
        
        $projets = Projet::orderBy('nom')->get();
        $users = User::orderBy('name')->get();

        return Inertia::render('ressources-humaines/Progressions', [
            'progressions' => $progressions,
            'projets' => $projets,
            'users' => $users,
        ]);
    }

    public function storeProgression(Request $request)
    {
        try {
            $validated = $request->validate([
                'projet_id' => 'required|exists:projets,id',
                'description_progress' => 'required|string|max:1000',
                'progress_file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif,txt,xlsx,xls|max:10240', 
                'statut' => 'required|in:valide,en_attente,rejete', 
                'date_validation' => 'nullable|date',
                'pourcentage' => 'required|numeric|min:0|max:100',
                'commentaire' => 'nullable|string|max:1000',
                'valide_par' => 'nullable|exists:users,id',
            ]);

            if ($request->hasFile('progress_file')) {
                $file = $request->file('progress_file');
                
                $originalName = $file->getClientOriginalName();
                $cleanName = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $originalName);
                $fileName = time() . '_' . $cleanName;
                
                $filePath = $file->storeAs('progress-files', $fileName, 'public');
                
                $validated['progress'] = $filePath;
            }

            unset($validated['progress_file']);

            if (empty($validated['date_validation'])) {
                $validated['date_validation'] = null;
            }
            
            if (empty($validated['commentaire'])) {
                $validated['commentaire'] = null;
            }
            
            if (empty($validated['valide_par'])) {
                $validated['valide_par'] = null;
            }

            $progression = Progression::create($validated);

            return redirect()->back()->with('success', 'Progression ajoutée avec succès.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur de validation progression:', $e->errors());
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Erreur création progression:', [
                'message' => $e->getMessage(),
                'data' => $request->all()
            ]);
            return redirect()->back()
                ->with('error', 'Erreur lors de la création de la progression: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function updateProgression(Request $request, Progression $progression)
    {
        try {
            $validated = $request->validate([
                'projet_id' => 'required|exists:projets,id',
                'description_progress' => 'required|string|max:1000',
                'progress_file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif,txt,xlsx,xls|max:10240', 
                'statut' => 'required|in:valide,en_attente,rejete', 
                'date_validation' => 'nullable|date',
                'pourcentage' => 'required|numeric|min:0|max:100',
                'commentaire' => 'nullable|string|max:1000',
                'valide_par' => 'nullable|exists:users,id',
            ]);

            if ($request->hasFile('progress_file')) {
                if ($progression->progress && Storage::disk('public')->exists($progression->progress)) {
                    Storage::disk('public')->delete($progression->progress);
                }
                
                $file = $request->file('progress_file');
                
                $originalName = $file->getClientOriginalName();
                $cleanName = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $originalName);
                $fileName = time() . '_' . $cleanName;
                
                $filePath = $file->storeAs('progress-files', $fileName, 'public');
                
                $validated['progress'] = $filePath;
            }

            unset($validated['progress_file']);

            if (empty($validated['date_validation'])) {
                $validated['date_validation'] = null;
            }
            
            if (empty($validated['commentaire'])) {
                $validated['commentaire'] = null;
            }
            
            if (empty($validated['valide_par'])) {
                $validated['valide_par'] = null;
            }

            $progression->update($validated);

            return redirect()->back()->with('success', 'Progression mise à jour avec succès.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur de validation mise à jour progression:', $e->errors());
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Erreur mise à jour progression:', [
                'message' => $e->getMessage(),
                'data' => $request->all(),
                'progression_id' => $progression->id
            ]);
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour de la progression: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroyProgression(Progression $progression)
    {
        try {
            if ($progression->progress && Storage::disk('public')->exists($progression->progress)) {
                Storage::disk('public')->delete($progression->progress);
            }
            
            $progression->delete();
            return redirect()->back()->with('success', 'Progression supprimée avec succès.');
        } catch (\Exception $e) {
            Log::error('Erreur suppression progression:', [
                'message' => $e->getMessage(),
                'progression_id' => $progression->id
            ]);
            return redirect()->back()->with('error', 'Erreur lors de la suppression de la progression.');
        }
    }

    public function vehicules()
    {
        $vehicules = Vehicule::with('salarie')->orderBy('created_at', 'desc')->get();
        $salaries = Salarie::orderBy('nom')->get();

        return Inertia::render('ressources-humaines/Vehicules', [
            'vehicules' => $vehicules,
            'salaries' => $salaries,
        ]);
    }

    public function storeVehicule(Request $request)
    {
        $validated = $request->validate([
            'modele' => 'required|string|max:255',
            'matricule' => 'required|string|max:255|unique:vehicules',
            'marque' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'etat' => 'required|in:disponible,en_panne,en_mission',
            'cout_location_jour' => 'nullable|numeric|min:0',
            'date_affectation' => 'nullable|date',
            'date_disponibilite' => 'nullable|date',
            'duree_affectation' => 'nullable|integer|min:1',
            'salarie_id' => 'nullable|exists:salaries,id',
            'duree_location' => 'nullable|integer|min:1',
            'statut' => 'nullable|in:achete,loue',
            'date_achat' => 'nullable|date',
            'type_paiement' => 'nullable|in:espece,credit',
            'montant_achat' => 'nullable|numeric|min:0',
            'montant_credit_total' => 'nullable|numeric|min:0',
            'montant_credit_mensuel' => 'nullable|numeric|min:0',
            'duree_credit_mois' => 'nullable|integer|min:1',
            'date_debut_credit' => 'nullable|date',
            'date_debut_location' => 'nullable|date',
            'date_fin_location' => 'nullable|date',
            'cout_location' => 'nullable|numeric|min:0',
        ]);

        if ($validated['statut'] === 'achete' && empty($validated['montant_achat'])) {
            return back()->withErrors(['montant_achat' => 'Le montant d\'achat est requis pour un véhicule acheté.']);
        }

        $vehicule = Vehicule::create($validated);

        return redirect()->back()->with('success', 'Véhicule ajouté avec succès.');
    }

    public function updateVehicule(Request $request, Vehicule $vehicule)
    {
        $validated = $request->validate([
            'modele' => 'required|string|max:255',
            'matricule' => 'required|string|max:255|unique:vehicules,matricule,' . $vehicule->id,
            'marque' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'etat' => 'required|in:disponible,en_panne,en_mission',
            'cout_location_jour' => 'nullable|numeric|min:0',
            'date_affectation' => 'nullable|date',
            'date_disponibilite' => 'nullable|date',
            'duree_affectation' => 'nullable|integer|min:1',
            'salarie_id' => 'nullable|exists:salaries,id',
            'duree_location' => 'nullable|integer|min:1',
            'statut' => 'nullable|in:achete,loue',
            'date_achat' => 'nullable|date',
            'type_paiement' => 'nullable|in:espece,credit',
            'montant_achat' => 'nullable|numeric|min:0',
            'montant_credit_total' => 'nullable|numeric|min:0',
            'montant_credit_mensuel' => 'nullable|numeric|min:0',
            'duree_credit_mois' => 'nullable|integer|min:1',
            'date_debut_credit' => 'nullable|date',
            'date_debut_location' => 'nullable|date',
            'date_fin_location' => 'nullable|date',
            'cout_location' => 'nullable|numeric|min:0',
        ]);

        if ($validated['statut'] === 'achete' && empty($validated['montant_achat'])) {
            return back()->withErrors(['montant_achat' => 'Le montant d\'achat est requis pour un véhicule acheté.']);
        }

        $vehicule->update($validated);

        return redirect()->back()->with('success', 'Véhicule mis à jour avec succès.');
    }

    public function destroyVehicule(Vehicule $vehicule)
    {
        $vehicule->delete();
        return redirect()->back()->with('success', 'Véhicule supprimé avec succès.');
    }

    public function materiels()
    {
        $materiels = Materiel::with('salarie')->orderBy('created_at', 'desc')->get();
        $salaries = Salarie::orderBy('nom')->get();

        return Inertia::render('ressources-humaines/Materiels', [
            'materiels' => $materiels,
            'salaries' => $salaries,
        ]);
    }

######################################################################################################


 // Méthode pour afficher la page des formations
    public function formations()
    {
        $formations = Formation::with(['responsable', 'participants'])
            ->withCount('participants')
            ->orderBy('created_at', 'desc')
            ->get();

        $users = User::all();
        $salaries = Salarie::where('statut', 'actif')->get(['id', 'nom', 'prenom', 'email', 'statut']);

        return Inertia::render('ressources-humaines/Formations', [
            'formations' => $formations,
            'users' => $users,
            'salaries' => $salaries,
        ]);
    }

    // Méthode pour créer une formation 
    public function storeFormation(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:en_ligne,presentiel',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'duree' => 'nullable|integer|min:1',
            'statut' => 'required|in:planifiée,en cours,terminée',
            'responsable_id' => 'required|exists:users,id',
            'competences' => 'nullable|string',
            'lien_meet' => 'nullable|url',
            'participants' => 'nullable|array',
            'participants.*' => 'exists:salaries,id',
        ]);

        // Vérifier si la formation est en ligne et le lien est fourni
        if ($validated['type'] === 'en_ligne' && empty($validated['lien_meet'])) {
            return redirect()->back()->withErrors(['lien_meet' => 'Le lien Meet est requis pour une formation en ligne.']);
        }

        // Extraire les participants avant de créer la formation
        $participants = $validated['participants'] ?? [];
        unset($validated['participants']);

        $formation = Formation::create($validated);

        // Attacher les participants à la formation
        if (!empty($participants)) {
            $participantsData = [];
            foreach ($participants as $participantId) {
                $participantsData[$participantId] = [
                    'statut' => 'inscrit',
                    'progression' => 0,
                ];
            }
            $formation->participants()->attach($participantsData);
        }

        return redirect()->back()->with('success', 'Formation créée avec succès.');
    }

    // Méthode pour mettre à jour une formation
    public function updateFormation(Request $request, Formation $formation)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:en_ligne,presentiel',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'duree' => 'nullable|integer|min:1',
            'statut' => 'required|in:planifiée,en cours,terminée',
            'responsable_id' => 'required|exists:users,id',
            'competences' => 'nullable|string',
            'lien_meet' => 'nullable|url',
            'participants' => 'nullable|array',
            'participants.*' => 'exists:salaries,id',
        ]);

        // Vérifier si la formation est en ligne et le lien est fourni
        if ($validated['type'] === 'en_ligne' && empty($validated['lien_meet'])) {
            return redirect()->back()->withErrors(['lien_meet' => 'Le lien Meet est requis pour une formation en ligne.']);
        }

        // Extraire les participants avant de mettre à jour la formation
        $participants = $validated['participants'] ?? [];
        unset($validated['participants']);

        $formation->update($validated);

        // Synchroniser les participants (remplace tous les participants existants)
        if (!empty($participants)) {
            $participantsData = [];
            foreach ($participants as $participantId) {
                $participantsData[$participantId] = [
                    'statut' => 'inscrit',
                    'progression' => 0,
                ];
            }
            $formation->participants()->sync($participantsData);
        } else {
            // Si aucun participant sélectionné, détacher tous les participants
            $formation->participants()->detach();
        }

        return redirect()->back()->with('success', 'Formation mise à jour avec succès.');
    }

    // Méthode pour supprimer une formation
    public function destroyFormation(Formation $formation)
    {
        $formation->delete();
        return redirect()->back()->with('success', 'Formation supprimée avec succès.');
    }

    // Méthode pour récupérer les formations avec les participants
    public function getFormationsWithParticipants()
    {
        $formations = Formation::with(['responsable', 'participants'])
            ->withCount('participants')
            ->orderBy('created_at', 'desc')
            ->get();

        $users = User::all();
        $salaries = Salarie::where('statut', 'actif')->get();

        return inertia('Formations', [
            'formations' => $formations,
            'users' => $users,
            'salaries' => $salaries,
        ]);
    }

######################################################################################################

    public function storeMateriel(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'marque' => 'required|string|max:255',
            'type' => 'required|in:electronique,mecanique,informatique,autre',
            'etat' => 'required|in:disponible,en_panne,en_mission',
            'cout_location_jour' => 'nullable|numeric|min:0',
            'date_acquisition' => 'nullable|date',
            'duree_location' => 'nullable|integer|min:1',
            'salarie_id' => 'nullable|exists:salaries,id',
            'statut' => 'nullable|in:achete,loue',
            'type_paiement' => 'nullable|in:espece,credit',
            'montant_achat' => 'nullable|numeric|min:0',
            'montant_credit_total' => 'nullable|numeric|min:0',
            'montant_credit_mensuel' => 'nullable|numeric|min:0',
            'duree_credit_mois' => 'nullable|integer|min:1',
            'date_debut_credit' => 'nullable|date',
            'date_debut_location' => 'nullable|date',
            'date_fin_location' => 'nullable|date',
            'cout_location' => 'nullable|numeric|min:0',
        ]);

        if ($validated['statut'] === 'achete' && empty($validated['montant_achat'])) {
            return back()->withErrors(['montant_achat' => 'Le montant d\'achat est requis pour un matériel acheté.']);
        }

        $materiel = Materiel::create($validated);

        return redirect()->back()->with('success', 'Matériel ajouté avec succès.');
    }

    public function updateMateriel(Request $request, Materiel $materiel)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'marque' => 'required|string|max:255',
            'type' => 'required|in:electronique,mecanique,informatique,autre',
            'etat' => 'required|in:disponible,en_panne,en_mission',
            'cout_location_jour' => 'nullable|numeric|min:0',
            'date_acquisition' => 'nullable|date',
            'duree_location' => 'nullable|integer|min:1',
            'salarie_id' => 'nullable|exists:salaries,id',
            'statut' => 'nullable|in:achete,loue',
            'type_paiement' => 'nullable|in:espece,credit',
            'montant_achat' => 'nullable|numeric|min:0',
            'montant_credit_total' => 'nullable|numeric|min:0',
            'montant_credit_mensuel' => 'nullable|numeric|min:0',
            'duree_credit_mois' => 'nullable|integer|min:1',
            'date_debut_credit' => 'nullable|date',
            'date_debut_location' => 'nullable|date',
            'date_fin_location' => 'nullable|date',
            'cout_location' => 'nullable|numeric|min:0',
        ]);

        if ($validated['statut'] === 'achete' && empty($validated['montant_achat'])) {
            return back()->withErrors(['montant_achat' => 'Le montant d\'achat est requis pour un matériel acheté.']);
        }

        $materiel->update($validated);

        return redirect()->back()->with('success', 'Matériel mis à jour avec succès.');
    }

    public function destroyMateriel(Materiel $materiel)
    {
        $materiel->delete();
        return redirect()->back()->with('success', 'Matériel supprimé avec succès.');
    }

    public function store(Request $request)
    {
        // 1. Validate incoming request
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget_total' => 'required|numeric',
            'budget_utilise' => 'nullable|numeric',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'statut' => 'required|in:en_cours,termine,en_attente',
            'client' => 'nullable|string|max:255',
            'lieu_realisation' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius' => 'nullable|numeric',
            'responsable_id' => 'required|exists:users,id',
            'type_projet' => 'required|in:suivi,etude,controle',
            'rh_needs' => 'required|array',
        ]);

        // 2. Get all doc requis IDs and format them
        $docsNeeds = DocsRequis::all()->map(function ($doc) {
            return [
                'doc_req_id' => $doc->id,
                'file_id' => ''
            ];
        })->toArray();

        // 3. Add docs_needs to validated data
        $validated['docs_needs'] = $docsNeeds;

        // 4. Create the projet
        $projet = Projet::create($validated);

        // 5. Calculate total profiles
        $totalProfiles = collect($validated['rh_needs'])->sum('number');

        // 6. Create notification
        Notification::create([
            'titre' => 'Nouveau Projet',   // ✅ required column
            'commentaire' => "Nouveau Projet - {$validated['nom']}, Veuillez Commencer L'affectaion de {$totalProfiles} Profils!",
            'type' => 'info',               // optional
            'user_id' => null,              // if needed
            'sender' => 'ressources-humaines', // only if your model/table supports it
            'receiver' => 'suivi-controle',    // only if your model/table supports it
            'statut' => 'actif',               // only if your table has this column
            'recorded_at' => Carbon::now(),    // only if your table has this column
        ]);


        // 7. Redirect with success
        return redirect()->back()->with('success', 'Projet ajouté avec succès.');
    }

    public function update(Request $request, Projet $projet)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget_total' => 'required|numeric',
            'budget_utilise' => 'nullable|numeric',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'statut' => 'required|in:en_cours,termine,en_attente',
            'client' => 'nullable|string|max:255',
            'lieu_realisation' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius' => 'nullable|numeric',
            'responsable_id' => 'required|exists:users,id',
            'type_projet' => 'required|in:suivi,etude,controle',
        ]);

        $projet->update($validated);

        return redirect()->back()->with('success', 'Projet mis à jour avec succès.');
    }

    public function destroy(Projet $projet)
    {
        $projet->delete();
        return redirect()->back()->with('success', 'Projet supprimé avec succès.');
    }


   public function Users()
    {
        $projects = Projet::select('id', 'nom')->get();

        $users = Salarie::with(['profils', 'vehicule'])->get();

        $users->transform(function ($user) {
            $projectIds = $user->projet_ids;

            if (is_string($projectIds)) {
                $projectIds = json_decode($projectIds, true) ?? [];
            } elseif (!is_array($projectIds)) {
                $projectIds = [];
            }

            $user->projects_count = count($projectIds);

            $profilStrings = $user->profils->map(function ($profil) {
                return "{$profil->poste_profil} - {$profil->nom_profil}";
            });

            $user->profil_string = $profilStrings->implode(', ');

            $user->vehicule_data = $user->vehicule ?? null;

            return $user;
        });

        $users->makeHidden(['password']);

        if (request()->wantsJson()) {
            return response()->json([
                'projects' => $projects,
                'users'    => $users,
            ]);
        }

        return Inertia::render('ressources-humaines/Users', [
            'projects' => $projects,
            'users'    => $users,
        ]);
    }

    public function getUserProjects(Salarie $salarie)
    {
        $projetIds = $salarie->projet_ids ?? [];

        if (empty($projetIds)) {
            return response()->json(['message' => 'No projects found for this salarie'], 404);
        }

        $projects = Projet::whereIn('id', $projetIds)->get();

        return response()->json($projects);
    }





    public function getProjects()
    {
        $projects = Projet::all();

        if (empty($projects)) {
            return response()->json(['message' => 'No projects found for this salarie'], 404);
        }

        return response()->json($projects);
    }

    public function getUser(Salarie $user)
    {
        return response()->json($user);
    }

    public function storeUsers(Request $request)
    {
        $validatedData = $request->validate([
            'nom'            => 'required|string|max:255',
            'prenom'         => 'required|string|max:255',
            'email'          => 'required|string|email|max:255|unique:salaries',
            'telephone'      => 'required|string|max:20',
            'salaire_mensuel'=> 'required|numeric',
            'date_embauche'  => 'nullable|date',
            'nom_profil'     => 'required|in:bureau_etudes,construction,suivi_controle,support_gestion',
            'poste_profil'   => 'required|string|max:255',
        ]);

        try {
            $salarie = Salarie::create([
                'nom'             => $validatedData['nom'],
                'prenom'          => $validatedData['prenom'],
                'email'           => $validatedData['email'],
                'telephone'       => $validatedData['telephone'],
                'salaire_mensuel' => $validatedData['salaire_mensuel'],
                'date_embauche'   => $validatedData['date_embauche'] ?? null,
                'statut'          => 'actif',
                'projet_ids'      => json_encode([]),
            ]);

            $salarie->assignRole('salarie', 'salarie');

            $profil = Profil::create([
                'user_id'      => $salarie->id,
                'nom_profil'   => $validatedData['nom_profil'],
                'poste_profil' => $validatedData['poste_profil'],
            ]);

            Log::info('Salarie created', ['salarie' => $salarie->toArray()]);
            Log::info('Profil created',  ['profil'  => $profil->toArray()]);

            return redirect()->back()->with([
                'success' => 'Employé créé avec succès, notification envoyée aux admin.',
                'created' => [
                    'salarie' => $salarie->only(['id','nom','prenom','email','telephone','statut']),
                    'profil'  => $profil->only(['id','user_id','nom_profil','poste_profil']),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Error creating user', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Erreur lors de la création de l\'employé.');
        }
    }


    // ========================================
    // ACCESS MANAGEMENT
    // ========================================
    
public function access() 
    {
        // Load salaries with their profil and projects
        $salaries = Salarie::with(['projets', 'profil'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all projects for the assignment dialog
        $projets = Projet::orderBy('nom', 'asc')->get();
        
        // Get all active profils
        $profils = Profil::where('actif', true)
            ->orderBy('categorie_profil', 'asc')
            ->get();

        return Inertia::render('ressources-humaines/Access', [
            'salaries' => $salaries,
            'projets' => $projets,
            'profils' => $profils,
        ]);
    }

    public function storeAccess(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:salaries,email',
                'telephone' => 'required|string|max:255',
                'password' => 'required|string|min:6',
                'poste' => 'nullable|string|max:255',
                'salaire_mensuel' => 'nullable|numeric|min:0',
                'date_embauche' => 'nullable|date',
                'statut' => 'nullable|in:actif,inactif,conge,demission',
                'profil_id' => 'nullable|exists:profils,id',
            ]);

            DB::beginTransaction();

            Log::info('Creating salarie with data:', $validated);

            $salarie = Salarie::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
                'telephone' => $validated['telephone'],
                'password' => Hash::make($validated['password']), // Explicitly use Hash::make
                'poste' => $validated['poste'] ?? null,
                'salaire_mensuel' => $validated['salaire_mensuel'] ?? null,
                'date_embauche' => $validated['date_embauche'] ?? null,
                'statut' => $validated['statut'] ?? 'actif',
                'profil_id' => $validated['profil_id'] ?? null,
                'is_accepted' => true, // Auto-approve or set to false for manual approval
            ]);

            Log::info('Salarie created successfully:', ['id' => $salarie->id]);

            DB::commit();

            return redirect()->back()->with('success', 'Accès créé avec succès.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error storing access', [
                'errors' => $e->errors()
            ]);
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing access', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                ->with('error', 'Erreur lors de la création de l\'accès: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function updateAccess(Request $request, Salarie $salarie)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:salaries,email,' . $salarie->id,
                'telephone' => 'required|string|max:255',
                'password' => 'nullable|string|min:6',
                'poste' => 'nullable|string|max:255',
                'salaire_mensuel' => 'nullable|numeric|min:0',
                'date_embauche' => 'nullable|date',
                'statut' => 'nullable|in:actif,inactif,conge,demission',
                'profil_id' => 'nullable|exists:profils,id',
            ]);

            DB::beginTransaction();

            $salarieData = [
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
                'telephone' => $validated['telephone'],
                'poste' => $validated['poste'] ?? null,
                'salaire_mensuel' => $validated['salaire_mensuel'] ?? null,
                'date_embauche' => $validated['date_embauche'] ?? null,
                'statut' => $validated['statut'] ?? 'actif',
                'profil_id' => $validated['profil_id'] ?? null,
            ];

            // Only update password if provided
            if (!empty($validated['password'])) {
                $salarieData['password'] = Hash::make($validated['password']);
            }

            $salarie->update($salarieData);

            Log::info('Salarie updated successfully:', ['id' => $salarie->id]);

            DB::commit();

            return redirect()->back()->with('success', 'Accès mis à jour avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating access', [
                'message' => $e->getMessage()
            ]);
            
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour de l\'accès: ' . $e->getMessage());
        }
    }

    public function destroyAccess(Salarie $salarie)
    {
        try {
            DB::beginTransaction();

            $salarieId = $salarie->id;
            
            // Delete the salarie
            $salarie->delete();
            
            Log::info('Salarie deleted successfully:', ['id' => $salarieId]);
            
            DB::commit();

            return redirect()->back()->with('success', 'Accès supprimé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur suppression accès:', [
                'message' => $e->getMessage(),
                'salarie_id' => $salarie->id
            ]);
            return redirect()->back()->with('error', 'Erreur lors de la suppression de l\'accès.');
        }
    }

    public function updateUserPass(Request $request, Salarie $salarie)
    {
        $validated = $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $salarie->password = Hash::make($validated['new_password']);
            $salarie->save();

            return back()->with('success', 'Le password du salarié a été mis à jour.');
        } catch (\Exception $e) {
            Log::error('Error updating password: ' . $e->getMessage());
            return back()->with('error', 'Erreur lors de la mise à jour du password.');
        }
    }

    public function affecterProjets(Request $request, Salarie $salarie)
    {
        $validated = $request->validate([
            'projet_ids' => 'required|array',
            'projet_ids.*' => 'exists:projets,id',
        ]);

        try {
            // Sync projects to salarie
            $salarie->projets()->sync($validated['projet_ids']);

            return redirect()->back()->with('success', 'Projets affectés avec succès.');
        } catch (\Exception $e) {
            Log::error('Error assigning projects', [
                'message' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Erreur lors de l\'affectation des projets.');
        }
    }

    public function affecterProfil(Request $request, Salarie $salarie)
    {
        $validated = $request->validate(['profil_id' => 'required|exists:profils,id']);

        try {
            DB::beginTransaction();

            Log::debug('Assigning profil', [
                'salarie_id' => $salarie->id,
                'profil_id' => $validated['profil_id'],
                'current_profil_id' => $salarie->profil_id,
            ]);

            // Assign new profil
            $salarie->update(['profil_id' => $validated['profil_id']]);

            DB::commit();

            return redirect()->back()->with('success', 'Profil assigné avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error assigning profil', ['message' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Erreur lors de l\'assignation du profil.');
        }
    }

    public function storeProfil(Request $request)
    {
        try {
            $validated = $request->validate([
                'categorie_profil' => 'required|string|max:255',
                'poste_profil' => 'required|string|max:255',
                'niveau_experience' => 'required|in:junior,intermediaire,senior,expert',
                'competences_techniques' => 'nullable|array',
                'certifications' => 'nullable|array',
                'missions' => 'nullable|string',
                'actif' => 'boolean',
            ]);

            $profil = Profil::create([
                'categorie_profil' => $validated['categorie_profil'],
                'poste_profil' => $validated['poste_profil'],
                'niveau_experience' => $validated['niveau_experience'],
                'competences_techniques' => $validated['competences_techniques'] ?? null,
                'certifications' => $validated['certifications'] ?? null,
                'missions' => $validated['missions'] ?? null,
                'actif' => $validated['actif'] ?? true,
            ]);

            return redirect()->back()->with('success', 'Profil créé avec succès.');

        } catch (\Exception $e) {
            Log::error('Error creating profil', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                ->with('error', 'Erreur lors de la création du profil: ' . $e->getMessage());
        }
    }
    

























































    public function SousTrais()
    {
        $projets = Projet::with('responsable')->get();

        return Inertia::render('ressources-humaines/SousTraitants', [
            'projets' => $projets,
        ]);
    }




























public function automateConsultation(Request $request)
{
    try {
        // Validation des données
        $validated = $request->validate([
            'consultation_url' => 'required|url',
            'marche_reference' => 'required|string',
            'marche_id' => 'required|exists:projet_mps,id',
        ]);

        Log::info('🚀 LANCEMENT AUTOMATISATION CONSULTATION', [
            'marche_id' => $validated['marche_id'],
            'reference' => $validated['marche_reference'],
            'url' => $validated['consultation_url'],
        ]);

        $pythonScript = base_path('selenium_scripts/consultation_automation.py');

        // Vérifier que le script existe
        if (!file_exists($pythonScript)) {
            return response()->json([
                'success' => false,
                'message' => 'Script Python d\'automatisation introuvable : ' . $pythonScript
            ], 500);
        }

        // Lock pour éviter les exécutions simultanées
        $lockKey = 'consultation_automation_' . $validated['marche_id'];
        $lock = Cache::lock($lockKey, 300); // 5 minutes

        if (!$lock->get()) {
            return response()->json([
                'success' => false,
                'message' => 'Une automatisation est déjà en cours pour ce marché. Veuillez patienter.'
            ], 423);
        }

        try {
            // Préparer les arguments pour le script Python
            $consultationUrl = escapeshellarg($validated['consultation_url']);
            $marcheReference = escapeshellarg($validated['marche_reference']);

            // Exécuter le script Python de manière synchrone
            $command = "python \"{$pythonScript}\" {$consultationUrl} {$marcheReference}";
            
            Log::info('Commande Python à exécuter: ' . $command);

            // Exécution avec timeout
            $output = [];
            $returnCode = 0;
            
            // Exécuter et capturer la sortie
            exec($command . ' 2>&1', $output, $returnCode);
            
            $outputString = implode("\n", $output);
            
            Log::info('Sortie du script Python:', [
                'return_code' => $returnCode,
                'output' => $outputString,
            ]);

            // Lire les résultats du fichier JSON généré par le script
            $resultsFile = base_path('selenium_scripts/consultation_automation_results.json');
            $results = [];
            
            if (file_exists($resultsFile)) {
                $resultsContent = file_get_contents($resultsFile);
                $results = json_decode($resultsContent, true) ?? [];
                
                Log::info('Résultats de l\'automatisation:', $results);
                
                // Supprimer le fichier de résultats après lecture
                unlink($resultsFile);
            }

            // Analyser les résultats
            if ($returnCode === 0 && isset($results['success']) && $results['success']) {
                Log::info('✅ Automatisation réussie pour le marché: ' . $validated['marche_reference']);
                
                return response()->json([
                    'success' => true,
                    'message' => $results['message'] ?? 'Automatisation terminée avec succès',
                    'details' => [
                        'steps_completed' => $results['steps_completed'] ?? [],
                        'screenshots' => $results['screenshots'] ?? [],
                        'marche_reference' => $validated['marche_reference'],
                    ]
                ]);
            } else {
                Log::error('❌ Échec de l\'automatisation pour le marché: ' . $validated['marche_reference']);
                
                $errorMessage = $results['message'] ?? 'Erreur lors de l\'automatisation';
                $errors = $results['errors'] ?? [$outputString];
                
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
                    'details' => [
                        'errors' => $errors,
                        'return_code' => $returnCode,
                        'output' => $outputString,
                    ]
                ], 500);
            }

        } finally {
            $lock->release();
        }

    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('❌ Erreur de validation automatisation consultation:', $e->errors());
        return response()->json([
            'success' => false,
            'message' => 'Données de validation invalides',
            'errors' => $e->errors(),
        ], 422);

    } catch (\Exception $e) {
        Log::error('❌ Erreur générale automatisation consultation: ' . $e->getMessage());
        Log::error('Stack trace: ' . $e->getTraceAsString());

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de l\'automatisation: ' . $e->getMessage(),
            'debug' => app()->environment('local') ? [
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ] : null,
        ], 500);
    }
}


public function storeImportedDocuments(Request $request)
{
    try {
        Log::info('=== DÉBUT IMPORT DOCUMENTS AMÉLIORÉ ===');
        Log::info('Données reçues:', [
            'marche_id' => $request->input('marche_id'),
            'reference' => $request->input('reference'),
            'labels_count' => count($request->input('labels', [])),
        ]);

        // Validation des données de base
        $validated = $request->validate([
            'marche_id' => 'required|exists:projet_mps,id',
            'reference' => 'required|string',
            'labels' => 'required|array|min:1',
            'labels.*.name' => 'required|string|max:255',
            'labels.*.files' => 'required|array|min:1',
            'labels.*.files.*' => 'required|file|max:20480', // max 20 Mo par fichier
        ], [
            'marche_id.required' => 'L\'ID du marché est requis',
            'marche_id.exists' => 'Le marché spécifié n\'existe pas',
            'reference.required' => 'La référence est requise',
            'labels.required' => 'Au moins un label est requis',
            'labels.*.name.required' => 'Le nom du label est requis',
            'labels.*.files.required' => 'Au moins un fichier est requis par label',
            'labels.*.files.*.file' => 'Le fichier n\'est pas valide',
            'labels.*.files.*.max' => 'Le fichier ne peut pas dépasser 20 Mo',
        ]);

        Log::info('✅ Validation OK pour marché ID: ' . $validated['marche_id']);
        
        // Récupérer le projet marché public
        $projetMp = ProjetMp::findOrFail($validated['marche_id']);
        $reference = $this->sanitizeFileName($validated['reference']);
        
        Log::info('✅ Projet trouvé avec référence: ' . $reference);

        // 🎯 CHEMIN SELON VOS SPÉCIFICATIONS EXACTES
        // C:\xampp\htdocs\betconsulting\storage\app\public\marche_public\imported_files\{reference}
        $baseImportPath = "marche_public/imported_files/{$reference}";
        
        // Créer le chemin complet dans le storage public
        $fullStoragePath = storage_path('app/public/' . $baseImportPath);
        
        // S'assurer que le dossier de base existe
        if (!file_exists($fullStoragePath)) {
            mkdir($fullStoragePath, 0755, true);
            Log::info('📁 Dossier de base créé: ' . $fullStoragePath);
        }

        $savedDocuments = [];
        $totalFilesProcessed = 0;
        $totalSizeProcessed = 0;

        // Utilisation d'une transaction pour assurer la cohérence des données
        DB::beginTransaction();

        try {
            // Traiter chaque label avec ses fichiers
            foreach ($validated['labels'] as $labelIndex => $labelData) {
                $labelName = trim($labelData['name']);
                $files = $labelData['files'];
                
                Log::info("📋 Traitement du label: '{$labelName}' avec " . count($files) . " fichiers");

                // Créer un sous-dossier pour ce label dans le chemin spécifié
                $sanitizedLabelName = $this->sanitizeFileName($labelName);
                $labelPath = $baseImportPath . '/' . $sanitizedLabelName;
                $fullLabelPath = storage_path('app/public/' . $labelPath);
                
                if (!file_exists($fullLabelPath)) {
                    mkdir($fullLabelPath, 0755, true);
                    Log::info('📁 Sous-dossier label créé: ' . $fullLabelPath);
                }

                $savedFiles = [];

                // Sauvegarder chaque fichier du label
                foreach ($files as $fileIndex => $file) {
                    try {
                        if (!$file->isValid()) {
                            Log::error("❌ Fichier invalide à l'index {$fileIndex}");
                            continue;
                        }

                        $originalName = $file->getClientOriginalName();
                        $extension = $file->getClientOriginalExtension();
                        $sanitizedName = $this->sanitizeFileName(pathinfo($originalName, PATHINFO_FILENAME));
                        
                        // Nom unique pour éviter les conflits
                        $timestamp = now()->format('Y-m-d_H-i-s');
                        $uniqueFileName = "{$sanitizedName}_{$timestamp}_{$fileIndex}.{$extension}";
                        
                        // Chemin complet du fichier dans le label
                        $filePath = $labelPath . '/' . $uniqueFileName;
                        
                        // 🎯 SAUVEGARDER LE FICHIER DIRECTEMENT DANS LE STORAGE PUBLIC
                        $savedPath = $file->storeAs($labelPath, $uniqueFileName, 'public');

                        
                        if ($savedPath) {
                            $fileSize = $file->getSize();
                            $totalSizeProcessed += $fileSize;
                            
                            $savedFiles[] = [
                                'original_name' => $originalName,
                                'stored_name' => $uniqueFileName,
                                'path' => $filePath, // Chemin relatif pour la BD
                                'full_path' => $fullLabelPath . '/' . $uniqueFileName, // Chemin absolu
                                'size' => $fileSize,
                                'mime_type' => $file->getMimeType(),
                                'uploaded_at' => now()->toISOString(),
                            ];
                            
                            $totalFilesProcessed++;
                            Log::info("📄 Fichier sauvegardé: {$originalName} -> {$filePath}");
                        } else {
                            Log::error("❌ Échec de la sauvegarde du fichier: {$originalName}");
                        }
                        
                    } catch (\Exception $fileError) {
                        Log::error("❌ Erreur lors de la sauvegarde du fichier {$originalName}: " . $fileError->getMessage());
                        Log::error("Stack trace fichier: " . $fileError->getTraceAsString());
                    }
                }

                // Sauvegarder en base de données seulement si des fichiers ont été sauvés
                if (!empty($savedFiles)) {
                    $importedDocument = ImportedDocument::create([
                        'projet_mp_id' => $projetMp->id,
                        'label' => $labelName,
                        'files' => $savedFiles, // Stocké en JSON avec détails complets
                    ]);

                    $labelTotalSize = array_sum(array_column($savedFiles, 'size'));

                    $savedDocuments[] = [
                        'id' => $importedDocument->id,
                        'label' => $labelName,
                        'files_count' => count($savedFiles),
                        'total_size' => $labelTotalSize,
                        'files' => $savedFiles,
                        'created_at' => $importedDocument->created_at,
                        'storage_path' => $fullLabelPath,
                    ];

                    Log::info("✅ Label '{$labelName}' sauvegardé en BD avec " . count($savedFiles) . " fichiers ({$this->formatBytes($labelTotalSize)})");
                } else {
                    Log::warning("⚠️ Aucun fichier sauvegardé pour le label: {$labelName}");
                }
            }

            // Si tout s'est bien passé, valider la transaction
            DB::commit();

            Log::info('=== IMPORT TERMINÉ AVEC SUCCÈS ===');
            Log::info("📊 STATISTIQUES :");
            Log::info("   • Labels traités : " . count($savedDocuments));
            Log::info("   • Fichiers traités : {$totalFilesProcessed}");
            Log::info("   • Taille totale : " . $this->formatBytes($totalSizeProcessed));
            Log::info("   • Chemin de base : {$fullStoragePath}");
            Log::info("   • Structure : C:\\xampp\\htdocs\\betconsulting\\storage\\app\\public\\{$baseImportPath}");

            return response()->json([
                'success' => true,
                'message' => 'Documents importés avec succès dans le storage spécifié',
                'data' => [
                    'projet_mp_id' => $projetMp->id,
                    'reference' => $reference,
                    'base_path' => $baseImportPath,
                    'full_storage_path' => $fullStoragePath,
                    'windows_path' => str_replace('/', '\\', "C:\\xampp\\htdocs\\betconsulting\\storage\\app\\public\\{$baseImportPath}"),
                    'labels_processed' => count($savedDocuments),
                    'total_files' => $totalFilesProcessed,
                    'total_size' => $totalSizeProcessed,
                    'total_size_formatted' => $this->formatBytes($totalSizeProcessed),
                    'documents' => $savedDocuments,
                ],
            ], 201);

        } catch (\Exception $transactionError) {
            // Annuler la transaction en cas d'erreur
            DB::rollBack();
            
            Log::error('❌ Erreur lors de la transaction, rollback effectué');
            Log::error('Détails: ' . $transactionError->getMessage());
            
            throw $transactionError;
        }

    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('❌ Erreur de validation:', $e->errors());
        return response()->json([
            'success' => false,
            'message' => 'Erreur de validation',
            'errors' => $e->errors(),
        ], 422);
        
    } catch (\Exception $e) {
        Log::error('❌ Erreur générale lors de l\'import des documents: ' . $e->getMessage());
        Log::error('Stack trace: ' . $e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de l\'import des documents: ' . $e->getMessage(),
            'debug' => app()->environment('local') ? [
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString(),
            ] : null,
        ], 500);
    }
}

/**
 * Nettoie un nom de fichier pour éviter les problèmes de système de fichiers
 */
private function sanitizeFileName($filename)
{
    // Supprimer les caractères spéciaux dangereux
    $filename = preg_replace('/[<>:"\/\\\|?*]/', '_', $filename);
    
    // Remplacer les espaces par des underscores
    $filename = preg_replace('/\s+/', '_', $filename);
    
    // Supprimer les caractères non ASCII sauf les lettres accentuées courantes
    $filename = preg_replace('/[^\w\-\.àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]/u', '_', $filename);
    
    // Éviter les underscores multiples consécutifs
    $filename = preg_replace('/_{2,}/', '_', $filename);
    
    // Éviter les noms trop longs (max 100 caractères)
    $filename = substr($filename, 0, 100);
    
    // Éviter les noms vides
    if (empty($filename) || $filename === '' || $filename === '_') {
        $filename = 'fichier_' . time();
    }
    
    // Supprimer les underscores en début et fin
    $filename = trim($filename, '_');
    
    return $filename;
}

/**
 * Formate une taille en bytes en format lisible
 */
private function formatBytes($size, $precision = 2)
{
    if ($size === 0) return '0 B';
    
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $base = log($size, 1024);
    $pow = min(floor($base), count($units) - 1);
    
    return round($size / (1024 ** $pow), $precision) . ' ' . $units[$pow];
}

/**
 * Récupère les documents importés pour un marché public (amélioré)
 */
public function getImportedDocuments($marcheId)
{
    try {
        Log::info("📋 Récupération des documents importés pour le marché ID: {$marcheId}");
        
        $documents = ImportedDocument::where('projet_mp_id', $marcheId)
            ->with('projetMp:id,reference')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($document) {
                $totalSize = 0;
                $files = $document->files ?? [];
                
                // Calculer la taille totale
                foreach ($files as $file) {
                    $totalSize += $file['size'] ?? 0;
                }
                
                return [
                    'id' => $document->id,
                    'label' => $document->label,
                    'files' => $files,
                    'files_count' => count($files),
                    'total_size' => $totalSize,
                    'total_size_formatted' => $this->formatBytes($totalSize),
                    'created_at' => $document->created_at,
                    'updated_at' => $document->updated_at,
                    'projet_mp_reference' => $document->projetMp->reference ?? null,
                ];
            });

        Log::info("✅ {$documents->count()} document(s) trouvé(s) pour le marché {$marcheId}");

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
        
    } catch (\Exception $e) {
        Log::error('❌ Erreur lors de la récupération des documents: ' . $e->getMessage());
        Log::error('Stack trace: ' . $e->getTraceAsString());

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des documents',
            'error' => $e->getMessage(),
        ], 500);
    }
}

/**
 * Télécharge un fichier importé (amélioré avec sécurité)
 */
public function downloadImportedFile(Request $request)
{
    try {
        $filePath = $request->get('path');
        
        if (!$filePath) {
            Log::warning('❌ Tentative de téléchargement sans chemin de fichier');
            return response()->json(['error' => 'Chemin du fichier manquant'], 400);
        }

        // 🔒 SÉCURITÉ : s'assurer que le chemin est dans imported_files
        if (!str_contains($filePath, 'imported_files')) {
            Log::warning("❌ Tentative d'accès non autorisé au fichier: {$filePath}");
            return response()->json(['error' => 'Accès non autorisé - le fichier doit être dans imported_files'], 403);
        }

        // Construire le chemin complet avec normalisation
        $cleanPath = ltrim(str_replace(['\\', '//', '..'], ['/', '/', ''], $filePath), '/');
        $fullPath = storage_path('app/public/' . $cleanPath);
        
        Log::info("📄 Tentative de téléchargement du fichier:");
        Log::info("   • Chemin demandé: {$filePath}");
        Log::info("   • Chemin nettoyé: {$cleanPath}");
        Log::info("   • Chemin complet: {$fullPath}");
        
        // Vérifier que le fichier existe
        if (!file_exists($fullPath)) {
            Log::warning("❌ Fichier non trouvé: {$fullPath}");
            return response()->json(['error' => 'Fichier non trouvé'], 404);
        }

        // Vérifier que c'est bien un fichier (pas un dossier)
        if (!is_file($fullPath)) {
            Log::warning("❌ Le chemin ne correspond pas à un fichier: {$fullPath}");
            return response()->json(['error' => 'Le chemin ne correspond pas à un fichier'], 400);
        }

        Log::info("✅ Téléchargement du fichier autorisé: " . basename($fullPath));

        // Retourner le fichier pour téléchargement
        return response()->download($fullPath, basename($fullPath));
        
    } catch (\Exception $e) {
        Log::error('❌ Erreur lors du téléchargement: ' . $e->getMessage());
        Log::error('Stack trace: ' . $e->getTraceAsString());
        
        return response()->json([
            'error' => 'Erreur lors du téléchargement',
            'message' => $e->getMessage()
        ], 500);
    }
}



######################################################################################################

public function fetchMarchePublic()
    {
        set_time_limit(0); // Désactive la limite de temps d'exécution
        ini_set('memory_limit', '512M'); // Augmente la limite mémoire

        $pythonScript = base_path('selenium_scripts/marches_public.py');

        // Vérifier que le script existe
        if (!file_exists($pythonScript)) {
            return redirect()->back()
                ->with('error', 'Script Python introuvable : ' . $pythonScript);
        }

        $lock = Cache::lock('selenium_marche_public_lock', 400); // 30 minutes
        if (!$lock->get()) {
            return redirect()->back()
                ->with('error', 'Une exécution Selenium est déjà en cours, réessayez dans quelques minutes.');
        }

        try {
            Log::info("=== DÉMARRAGE DU PROCESSUS MARCHÉ PUBLIC ===");

            // 🔑 RÉCUPÉRER LES RÉFÉRENCES EXISTANTES AVANT TOUT
            $existingReferences = ProjetMp::pluck('reference')->filter()->unique()->toArray();
            Log::info("Références existantes en BD : " . count($existingReferences));
            
            // 🔑🔑 NOUVEAU : SAUVEGARDER LES RÉFÉRENCES POUR PYTHON 🔑🔑
            $existingReferencesFile = storage_path('app/public/marche_public/existing_references.json');
            // S'assurer que le dossier existe
            $marchePublicDir = dirname($existingReferencesFile);
            if (!is_dir($marchePublicDir)) {
                mkdir($marchePublicDir, 0755, true);
            }
            
            file_put_contents($existingReferencesFile, json_encode($existingReferences, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            Log::info("Fichier des références existantes créé pour Python : " . count($existingReferences) . " références");
            
            // Sauvegarder les références existantes dans le cache pour éviter les re-requêtes
            Cache::put('existing_references_marche_public', $existingReferences, 3600); // 1 heure

            $csvPath = storage_path('app/public/marche_public/marches_publics_data.csv');
            $jsonPath = storage_path('app/public/marche_public/marches_publics_data.json');

            // Supprimer les anciens fichiers pour éviter la confusion
            if (file_exists($csvPath)) {
                unlink($csvPath);
                Log::info("Ancien fichier CSV supprimé");
            }
            if (file_exists($jsonPath)) {
                unlink($jsonPath);
                Log::info("Ancien fichier JSON supprimé");
            }

            // Lancement du script Python
            Log::info("Lancement du script Python avec filtrage des doublons...");
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                pclose(popen("start /B python \"$pythonScript\"", "r"));
            } else {
                exec("nohup python3 \"$pythonScript\" > /dev/null 2>&1 &");
            }

            Log::info("Script Python lancé, attente de la génération des fichiers...");

            // === ATTENTE INTELLIGENTE DES FICHIERS ===
            $maxWaitTime = 3600; // 1 heure maximum
            $checkInterval = 10; // Vérifier toutes les 10 secondes
            $waited = 0;
            $lastLogTime = 0;

            while ($waited < $maxWaitTime) {
                $csvExists = file_exists($csvPath);
                $jsonExists = file_exists($jsonPath);
                
                // Log périodique pour éviter le spam
                if ($waited - $lastLogTime >= 60) { // Log toutes les minutes
                    Log::info("Attente des fichiers... {$waited}s écoulées (CSV: " . ($csvExists ? 'OK' : 'NON') . ", JSON: " . ($jsonExists ? 'OK' : 'NON') . ")");
                    $lastLogTime = $waited;
                }
                
                if ($csvExists && $jsonExists) {
                    Log::info("✅ Fichiers CSV et JSON détectés après {$waited} secondes");
                    
                    // Vérifier que les fichiers ne sont pas vides et sont valides
                    if ($this->validateFiles($csvPath, $jsonPath)) {
                        Log::info("✅ Fichiers validés, début de l'import");
                        break;
                    } else {
                        Log::info("⚠️ Fichiers détectés mais non valides, attente...");
                    }
                }
                
                sleep($checkInterval);
                $waited += $checkInterval;
            }

            if ($waited >= $maxWaitTime) {
                Log::error("❌ Timeout après {$maxWaitTime}s d'attente");
                return redirect()->back()
                    ->with('error', "Le script a pris trop de temps à générer les fichiers (timeout après {$maxWaitTime}s). Vérifiez les logs du script Python.");
            }

            // === ATTENTE SUPPLÉMENTAIRE POUR LES TÉLÉCHARGEMENTS ===
            Log::info("Attente supplémentaire pour finaliser les téléchargements et extractions...");
            $additionalWait = 60; // 1 minute supplémentaire
            sleep($additionalWait);

            // === IMPORT DES DONNÉES AVEC FILTRAGE DES DOUBLONS ===
            return $this->importDataFromFiles($csvPath, $jsonPath, $existingReferences);
            
        } catch (\Exception $e) {
            Log::error("❌ Erreur lors de l'exécution du script: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return redirect()->back()->with('error', 'Erreur lors de l\'exécution du script : ' . $e->getMessage());
        } finally {
            // Nettoyer le cache et les fichiers temporaires
            Cache::forget('existing_references_marche_public');
            
            // 🔑🔑 SUPPRIMER LE FICHIER DES RÉFÉRENCES EXISTANTES APRÈS USAGE 🔑🔑
            $existingReferencesFile = storage_path('app/public/marche_public/existing_references.json');
            if (file_exists($existingReferencesFile)) {
                unlink($existingReferencesFile);
                Log::info("Fichier temporaire des références existantes supprimé");
            }
            
            $lock->release();
        }
    }

    /**
     * Valide que les fichiers CSV et JSON sont correctement formés
     */
    private function validateFiles($csvPath, $jsonPath)
    {
        try {
            // Vérifier que les fichiers ne sont pas vides
            if (filesize($csvPath) < 100 || filesize($jsonPath) < 100) {
                return false;
            }
            
            // Vérifier que le JSON est valide
            $jsonContent = file_get_contents($jsonPath);
            $jsonData = json_decode($jsonContent, true);
            if (json_last_error() !== JSON_ERROR_NONE || empty($jsonData)) {
                return false;
            }
            
            // Vérifier que le CSV est lisible
            $csv = Reader::createFromPath($csvPath, 'r');
            $csv->setHeaderOffset(0);
            $headers = $csv->getHeader();
            if (empty($headers) || !in_array('reference', $headers)) {
                return false;
            }
            
            return true;
            
        } catch (\Exception $e) {
            Log::warning("Erreur lors de la validation des fichiers: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Import les données depuis les fichiers CSV et JSON avec filtrage des doublons
     */
    private function importDataFromFiles($csvPath, $jsonPath, $existingReferences = [])
    {
        try {
            Log::info("=== DÉBUT DE L'IMPORT DES DONNÉES AVEC FILTRAGE DOUBLONS ===");
            Log::info("Références existantes à ignorer : " . count($existingReferences));
            
            // Charger le JSON en mémoire pour les références croisées
            $jsonData = json_decode(file_get_contents($jsonPath), true) ?? [];
            $jsonIndex = [];
            foreach ($jsonData as $marche) {
                $referenceKey = trim($marche['reference'] ?? '');
                if ($referenceKey) {
                    $jsonIndex[$referenceKey] = $marche;
                }
            }
            Log::info("JSON chargé avec " . count($jsonData) . " entrées indexées");

            // === FONCTIONS UTILITAIRES ===
            $findZipFile = function ($reference, $basePath) {
                if (empty($reference)) return null;
                
                $exactPath = $basePath . DIRECTORY_SEPARATOR . $reference . '.zip';
                if (file_exists($exactPath)) return $exactPath;
                
                $pattern = $basePath . DIRECTORY_SEPARATOR . '*' . $reference . '*.zip';
                $files = glob($pattern);
                return !empty($files) ? $files[0] : null;
            };

            $findExtractedDir = function ($reference, $basePath) {
                if (empty($reference)) return null;
                
                $exactDir = $basePath . DIRECTORY_SEPARATOR . $reference . '_extrait';
                if (is_dir($exactDir)) return $exactDir;
                
                $pattern = $basePath . DIRECTORY_SEPARATOR . '*' . $reference . '*_extrait';
                $dirs = glob($pattern, GLOB_ONLYDIR);
                return !empty($dirs) ? $dirs[0] : null;
            };

            $parseDateMarche = function ($dateString) {
                if (empty($dateString) || in_array($dateString, ['---', 'N/A', ''])) {
                    return null;
                }
                try {
                    if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dateString)) {
                        return Carbon::createFromFormat('d/m/Y', $dateString)->format('Y-m-d');
                    }
                    return Carbon::parse($dateString)->format('Y-m-d');
                } catch (\Exception $e) {
                    Log::warning("Impossible de parser la date: {$dateString}");
                    return null;
                }
            };

            $parseDateLimiteMarche = function ($dateString) {
                if (empty($dateString) || in_array($dateString, ['---', 'N/A', ''])) {
                    return null;
                }
                try {
                    // Format français : "15 janvier 2024 à 10h30"
                    if (preg_match('/(\d{1,2})\s+(\w+)\s+(\d{4}).*?(\d{1,2})h(\d{2})/', $dateString, $matches)) {
                        $mois = [
                            'janvier' => '01', 'février' => '02', 'mars' => '03', 'avril' => '04',
                            'mai' => '05', 'juin' => '06', 'juillet' => '07', 'août' => '08',
                            'septembre' => '09', 'octobre' => '10', 'novembre' => '11', 'décembre' => '12'
                        ];
                        $jour = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                        $moisNum = $mois[strtolower($matches[2])] ?? '01';
                        $annee = $matches[3];
                        $heure = str_pad($matches[4], 2, '0', STR_PAD_LEFT);
                        $minute = $matches[5];
                        return "{$annee}-{$moisNum}-{$jour} {$heure}:{$minute}:00";
                    }
                    
                    if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/', $dateString)) {
                        return Carbon::createFromFormat('d/m/Y H:i', $dateString)->format('Y-m-d H:i:s');
                    }
                    
                    if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dateString)) {
                        return Carbon::createFromFormat('d/m/Y', $dateString)->format('Y-m-d H:i:s');
                    }
                    
                    return Carbon::parse($dateString)->format('Y-m-d H:i:s');
                } catch (\Exception $e) {
                    Log::warning("Impossible de parser la date limite: {$dateString}");
                    return null;
                }
            };

            // === TRAITEMENT DU CSV AVEC FILTRAGE ===
            $csv = Reader::createFromPath($csvPath, 'r');
            $csv->setHeaderOffset(0);
            $records = iterator_to_array($csv->getRecords());
            
            Log::info("CSV chargé avec " . count($records) . " enregistrements");

            // 🔑 FILTRER LES DOUBLONS AVANT TRAITEMENT
            $filteredRecords = [];
            $duplicateCount = 0;
            
            foreach ($records as $record) {
                $reference = trim($record['reference'] ?? '');
                
                if (empty($reference)) {
                    Log::warning("Référence vide ignorée");
                    continue;
                }
                
                // 🔑 VÉRIFIER SI LA RÉFÉRENCE EXISTE DÉJÀ
                if (in_array($reference, $existingReferences)) {
                    $duplicateCount++;
                    Log::info("🔄 DOUBLON IGNORÉ : {$reference} (Python a déjà fait le tri côté téléchargement)");
                    continue;
                }
                
                $filteredRecords[] = $record;
            }
            
            Log::info("=== FILTRAGE TERMINÉ ===");
            Log::info("Enregistrements total : " . count($records));
            Log::info("Doublons ignorés côté Laravel : {$duplicateCount}");
            Log::info("Nouveaux enregistrements à traiter : " . count($filteredRecords));

            // === TRAITEMENT DES NOUVEAUX ENREGISTREMENTS ===
            $insertedCount = 0;
            $updatedCount = 0;
            $errorCount = 0;
            $zipFoundCount = 0;
            $extractedFoundCount = 0;
            $marchePublicPath = storage_path('app/public/marche_public');

            // Traitement par batch pour optimiser les performances
            $batchSize = 50;
            $batches = array_chunk($filteredRecords, $batchSize);
            
            foreach ($batches as $batchIndex => $batch) {
                Log::info("Traitement du batch " . ($batchIndex + 1) . "/" . count($batches) . " (" . count($batch) . " enregistrements)");
                
                foreach ($batch as $index => $row) {
                    try {
                        $cleanRow = array_map('trim', $row);
                        $reference = $cleanRow['reference'] ?? '';
                        
                        if (empty($reference)) {
                            Log::warning("Référence vide à la ligne " . ($index + 1));
                            continue;
                        }

                        // 🔑 DOUBLE VÉRIFICATION (sécurité)
                        if (in_array($reference, $existingReferences)) {
                            Log::info("🔄 DOUBLON DÉTECTÉ LORS DU TRAITEMENT, IGNORÉ : {$reference}");
                            continue;
                        }

                        // Récupérer les données JSON correspondantes
                        $marcheJson = $jsonIndex[$reference] ?? [];

                        // 🔑 RECHERCHE DU FICHIER ZIP (SEULEMENT POUR NOUVEAUX)
                        $cheminZip = null;
                        $foundZipPath = $findZipFile($reference, $marchePublicPath);
                        if ($foundZipPath && file_exists($foundZipPath)) {
                            $cheminZip = "storage/marche_public/" . basename($foundZipPath);
                            $zipFoundCount++;
                            Log::info("📁 ZIP trouvé pour nouveau marché : {$reference}");
                        } else {
                            Log::info("📁 Aucun ZIP trouvé pour : {$reference}");
                        }

                        // 🔑 RECHERCHE DES FICHIERS EXTRAITS (SEULEMENT POUR NOUVEAUX)
                        $extractedFiles = [];
                        $foundExtractDir = $findExtractedDir($reference, $marchePublicPath);
                        if ($foundExtractDir && is_dir($foundExtractDir)) {
                            $iterator = new \RecursiveIteratorIterator(
                                new \RecursiveDirectoryIterator($foundExtractDir, \RecursiveDirectoryIterator::SKIP_DOTS)
                            );
                            foreach ($iterator as $file) {
                                if ($file->isFile()) {
                                    $relativePath = str_replace(storage_path('app/public/'), '', $file->getPathname());
                                    $relativePath = str_replace('\\', '/', $relativePath);
                                    $extractedFiles[] = "/storage/{$relativePath}";
                                }
                            }
                            if (!empty($extractedFiles)) {
                                $extractedFoundCount++;
                                Log::info("📂 Dossier extrait trouvé pour nouveau marché : {$reference} (" . count($extractedFiles) . " fichiers)");
                            }
                        } else {
                            Log::info("📂 Aucun dossier extrait trouvé pour : {$reference}");
                        }

                        // Préparation des données
                        $datePublication = $parseDateMarche($cleanRow['date_publication'] ?? '');
                        $dateLimite = $parseDateLimiteMarche($cleanRow['date_limite'] ?? '');
                        $extractedAt = !empty($cleanRow['extracted_at']) ? Carbon::parse($cleanRow['extracted_at']) : now();

                        $marcheData = [
                            'type_procedure' => $this->cleanValue($cleanRow['type_procedure'] ?? null),
                            'detail_procedure' => $this->cleanValue($cleanRow['detail_procedure'] ?? null),
                            'categorie' => $this->cleanValue($cleanRow['categorie'] ?? null),
                            'date_publication' => $datePublication,
                            'reference' => $reference,
                            'objet' => $this->cleanValue($cleanRow['objet'] ?? null),
                            'objet_complet' => $this->cleanValue($cleanRow['objet_complet'] ?? $cleanRow['objet'] ?? null),
                            'acheteur_public' => $this->cleanValue($cleanRow['acheteur_public'] ?? null),
                            'lieu_execution' => $this->cleanValue($cleanRow['lieu_execution'] ?? null),
                            'lieu_execution_complet' => $this->cleanValue($cleanRow['lieu_execution_complet'] ?? $cleanRow['lieu_execution'] ?? null),
                            'lien_detail_lots' => $this->cleanValue($cleanRow['lien_detail_lots'] ?? null),
                            'date_limite' => $dateLimite,
                            'type_reponse_electronique' => $this->cleanValue($cleanRow['type_reponse_electronique'] ?? null),
                            'lien_consultation' => $this->cleanValue($cleanRow['lien_consultation'] ?? null),
                            'ref_consultation_id' => $this->cleanValue($cleanRow['ref_consultation_id'] ?? null),
                            'extracted_at' => $extractedAt,
                            'row_index' => (int)($cleanRow['row_index'] ?? ($index + 1)),
                            'storage_link_csv' => 'storage/marche_public/marches_publics_data.csv',
                            'storage_link_json' => 'storage/marche_public/marches_publics_data.json',
                            'EXTRACTED_FILES' => json_encode($extractedFiles),
                            'chemin_zip' => $cheminZip,
                            'updated_at' => now(),
                        ];

                        // 🔑 INSERTION UNIQUEMENT (PAS DE MISE À JOUR CAR PAS DE DOUBLONS)
                        $projetMp = ProjetMp::create($marcheData);
                        $insertedCount++;
                        Log::info("✅ NOUVEAU MARCHÉ AJOUTÉ : {$reference}");

                    } catch (\Exception $e) {
                        $errorCount++;
                        Log::error("❌ Erreur insertion ligne " . ($index + 1) . " (ref: {$reference}): " . $e->getMessage());
                    }
                }
                
                // Petit délai entre les batches pour éviter la surcharge
                if ($batchIndex < count($batches) - 1) {
                    usleep(100000); // 0.1 seconde
                }
            }

            // === RÉSUMÉ FINAL ===
            $totalProcessed = $insertedCount + $updatedCount + $errorCount;
            
            Log::info("=== RÉSUMÉ DE L'IMPORT AVEC FILTRAGE DOUBLONS OPTIMISÉ ===");
            Log::info("Total enregistrements dans CSV: " . count($records));
            Log::info("🔄 Doublons ignorés côté Laravel: {$duplicateCount}");
            Log::info("Total lignes traitées: {$totalProcessed}");
            Log::info("✅ Nouvelles insertions: {$insertedCount}");
            Log::info("🔄 Mises à jour: {$updatedCount}");
            Log::info("❌ Erreurs: {$errorCount}");
            Log::info("📁 ZIP trouvés (nouveaux): {$zipFoundCount}");
            Log::info("📂 Dossiers extraits trouvés (nouveaux): {$extractedFoundCount}");
            Log::info("🚀 OPTIMISATION: Doublons évités côté Python (pas de téléchargement/extraction inutile)");

            $message = "Import marchés publics terminé avec filtrage optimisé des doublons !";
            $message .= " {$insertedCount} nouveaux marchés ajoutés";
            if ($duplicateCount > 0) $message .= ", {$duplicateCount} doublons ignorés côté Laravel";
            if ($updatedCount > 0) $message .= ", {$updatedCount} mis à jour";
            if ($errorCount > 0) $message .= ", {$errorCount} erreurs (voir logs)";
            if ($zipFoundCount > 0) $message .= ". {$zipFoundCount} fichiers ZIP traités";
            if ($extractedFoundCount > 0) $message .= ", {$extractedFoundCount} dossiers extraits traités";
            $message .= ". 🚀 Temps et bande passante économisés !";

            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            Log::error("❌ Erreur générale lors de l'importation: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return redirect()->back()->with('error', 'Erreur lors de l\'importation des marchés publics : ' . $e->getMessage());
        }
    }

    /**
     * Supprime récursivement un répertoire
     */
    private function deleteDirectory($dir)
    {
        if (!is_dir($dir)) {
            return false;
        }
        
        $files = array_diff(scandir($dir), array('.', '..'));
        foreach ($files as $file) {
            $path = $dir . DIRECTORY_SEPARATOR . $file;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }
        
        return rmdir($dir);
    }

    /**
     * Nettoie une valeur en supprimant les valeurs vides ou non significatives
     */
    private function cleanValue($value)
    {
        if (is_string($value)) {
            $value = trim($value);
            if (in_array($value, ['', '---', 'N/A', 'null', 'NULL'])) {
                return null;
            }
        }
        return $value;
    }
        
    
    public function getMarchePublicData()
    {
        $jsonPath = storage_path('app/public/marche_public/marches_publics_data.json');

        if (!file_exists($jsonPath)) {
            return response()->json([
                'error' => 'Fichier JSON non trouvé. Lancez d\'abord le script Selenium.'
            ], 404);
        }

        $jsonData = json_decode(file_get_contents($jsonPath), true) ?? [];

        return response()->json($jsonData);
    }

    public function marchePublicPage()
    {
        return Inertia::render('ressources-humaines/MarchePublic');
    }

    public function getMarchesPublicsData()
{
    $marchesPublics = ProjetMp::orderBy('date_publication', 'desc')->get();
    return response()->json($marchesPublics);
}













######################################################################################################################
######################################################################################################################
######################################################################################################################
######################################################################################################################
######################################################################################################################
######################################################################################################################












public function fetchBonsCommande()
    {
        $pythonScript = base_path('selenium_scripts/bons_commande.py');
        
        $lock = Cache::lock('selenium_lock', 300); // 5 min lock
        if (!$lock->get()) {
            return redirect()->route('ressources-humaines.bons-commandes')
                ->with('error', 'Une exécution Selenium est déjà en cours, réessayez dans quelques minutes.');
        }

        try {
            // Clear any existing status
            Cache::forget('scraping_status');
            Cache::put('scraping_status', 'running', 300);

            // Execute Python script in background
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                pclose(popen("start /B python $pythonScript", "r"));
            } else {
                exec("nohup python3 $pythonScript > /dev/null 2>&1 &");
            }

            return redirect()->route('ressources-humaines.bons-commandes')
                ->with('info', 'Récupération des données en cours... Veuillez patienter quelques instants puis actualiser la page.');

        } catch (\Exception $e) {
            Cache::forget('scraping_status');
            Log::error('Erreur lors du lancement du script Selenium:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('ressources-humaines.bons-commandes')
                ->with('error', 'Erreur lors du lancement du script : ' . $e->getMessage());
        } finally {
            $lock->release();
        }
    }

    public function importBonsFromJson()
    {
        $jsonPath = storage_path('app/public/bons_commande/bons_commande.json');
        
        if (!file_exists($jsonPath)) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier JSON introuvable. Lancez d\'abord la récupération des données.'
            ]);
        }

        try {
            $jsonData = json_decode(file_get_contents($jsonPath), true);
            if (!is_array($jsonData)) {
                throw new \Exception('Format JSON invalide');
            }

            $insertedCount = 0;
            $duplicateCount = 0;
            $errorCount = 0;

            foreach ($jsonData as $index => $bonData) {
                try {
                    // Clean and prepare data
                    $cleanData = $this->cleanBonData($bonData);
                    
                    if (!$cleanData['n_ordre'] && !$cleanData['reference']) {
                        Log::warning("Données manquantes pour l'enregistrement $index", $cleanData);
                        $errorCount++;
                        continue;
                    }

                    // Check for duplicates and insert
                    $bonCommande = BonCommande::firstOrCreate(
                        [
                            'n_ordre' => $cleanData['n_ordre'],
                            'reference' => $cleanData['reference']
                        ],
                        $cleanData
                    );

                    if ($bonCommande->wasRecentlyCreated) {
                        $insertedCount++;
                        Log::info("Bon de commande inséré (ID: {$bonCommande->id})", [
                            'n_ordre' => $cleanData['n_ordre'],
                            'reference' => $cleanData['reference']
                        ]);
                    } else {
                        $duplicateCount++;
                        Log::info("Doublon ignoré", [
                            'n_ordre' => $cleanData['n_ordre'],
                            'reference' => $cleanData['reference']
                        ]);
                    }

                } catch (\Exception $e) {
                    $errorCount++;
                    Log::error("Erreur insertion enregistrement $index", [
                        'error' => $e->getMessage(),
                        'line' => $e->getLine(),
                        'data' => $bonData
                    ]);
                }
            }

            // Update cache status
            Cache::put('scraping_status', 'completed', 60);

            $message = "Import terminé : $insertedCount nouveaux enregistrements ajoutés, $duplicateCount doublons ignorés.";
            if ($errorCount > 0) {
                $message .= " $errorCount erreurs détectées (voir logs).";
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'stats' => [
                    'inserted' => $insertedCount,
                    'duplicates' => $duplicateCount,
                    'errors' => $errorCount,
                    'total_processed' => count($jsonData)
                ]
            ]);

        } catch (\Exception $e) {
            Cache::put('scraping_status', 'error', 60);
            Log::error('Erreur lors de l\'importation depuis JSON:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'importation : ' . $e->getMessage()
            ]);
        }
    }

    private function cleanBonData($bonData)
    {
        // Parse date
        $dateLimit = $this->parseDate($bonData['Date/Heure limite'] ?? '');
        
        // Get extracted files
        $extractedFiles = $bonData['EXTRACTED_FILES'] ?? [];

        $cleanData = [
            'n_ordre' => $this->cleanString($bonData["N d'ordre"] ?? ''),
            'reference' => $this->cleanString($bonData['Référence'] ?? ''),
            'date_heure_limite' => $dateLimit,
            'objet' => $this->cleanString($bonData['Objet'] ?? $bonData['Objet '] ?? ''),
            'organisme' => $this->cleanString($bonData['Organisme'] ?? $bonData['Organisme '] ?? ''),
            'ville_execution' => $this->cleanString($bonData['Ville d\'exécution'] ?? $bonData['Ville d\'exécution '] ?? ''),
            'type' => $this->cleanString($bonData['Type'] ?? $bonData['Type '] ?? ''),
            'observation' => $this->cleanString($bonData['Obsérvation'] ?? $bonData['Observation'] ?? ''),
            'visite_lieux' => $this->cleanString($bonData['Visite des lieux'] ?? $bonData['Visite des lieux '] ?? ''),
            'telechargement_dao' => $this->cleanString($bonData['Téléchargement_DAO'] ?? ''),
            'lien_cliquer_ici' => $this->cleanString($bonData['Lien_Cliquer_Ici'] ?? ''),
            'soumission_electronique' => $this->cleanString($bonData['Soumission électronique'] ?? $bonData['Soumission électronique '] ?? ''),
            'chemin_fichiers' => !empty($extractedFiles) ? $extractedFiles : null,
        ];

        return $cleanData;
    }

    private function cleanString($value)
    {
        if (!is_string($value)) {
            return null;
        }
        
        $cleaned = trim($value);
        return ($cleaned === '' || $cleaned === '---' || $cleaned === 'N/A') ? null : $cleaned;
    }

    

    public function getBonsCommandeData()
    {
        $bons = BonCommande::orderBy('created_at', 'desc')->get();
        $scrapingStatus = Cache::get('scraping_status', 'idle');
        
        return Inertia::render('ressources-humaines/BonCommande', [
            'bonsCommande' => $bons,
            'scrapingStatus' => $scrapingStatus
        ]);
    }

    public function getScrapingStatus()
    {
        $status = Cache::get('scraping_status', 'idle');
        
        // If status is running, check if files exist to determine if we should import
        if ($status === 'running') {
            $jsonPath = storage_path('app/public/bons_commande/bons_commande.json');
            if (file_exists($jsonPath)) {
                // Files are ready, let's import
                $this->importBonsFromJson();
                $status = Cache::get('scraping_status', 'completed');
            }
        }

        return response()->json(['status' => $status]);
    }

    // List files in DAO archive
    public function listDaoFiles(Request $request)
    {
        $zipUrl = $request->get('zipPath');
        
        if (!$zipUrl) {
            return response()->json([]);
        }

        try {
            // Extract archive name from URL
            $urlParts = parse_url($zipUrl);
            $pathParts = explode('/', $urlParts['path']);
            $zipFileName = end($pathParts);
            
            // Find the corresponding extracted directory
            $baseDir = storage_path('app/public/bons_commande');
            $extractDir = null;
            
            // Look for directories that might contain this ZIP's files
            foreach (glob($baseDir . '/bon_*', GLOB_ONLYDIR) as $dir) {
                if (is_dir($dir)) {
                    $extractDir = $dir;
                    break; // For now, just get the first match
                }
            }
            
            if (!$extractDir || !is_dir($extractDir)) {
                return response()->json([]);
            }

            $files = [];
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($extractDir, \RecursiveDirectoryIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $relativePath = str_replace($extractDir . DIRECTORY_SEPARATOR, '', $file->getPathname());
                    $files[] = [
                        'name' => $file->getFilename(),
                        'path' => $relativePath,
                        'full_path' => $file->getPathname()
                    ];
                }
            }

            return response()->json($files);

        } catch (\Exception $e) {
            Log::error('Error listing DAO files:', [
                'error' => $e->getMessage(),
                'zipUrl' => $zipUrl
            ]);
            return response()->json([]);
        }
    }

    public function downloadDaoFile(Request $request)
    {
        $zipUrl = $request->get('zipPath');
        $filePath = $request->get('filePath');

        if (!$zipUrl || !$filePath) {
            return response()->json(['error' => 'Paramètres manquants'], 400);
        }

        try {
            // Find the extracted directory
            $baseDir = storage_path('app/public/bons_commande');
            $extractDir = null;
            
            foreach (glob($baseDir . '/bon_*', GLOB_ONLYDIR) as $dir) {
                $fullFilePath = $dir . DIRECTORY_SEPARATOR . $filePath;
                if (file_exists($fullFilePath)) {
                    $extractDir = $dir;
                    break;
                }
            }

            if (!$extractDir) {
                return response()->json(['error' => 'Fichier non trouvé'], 404);
            }

            $fullFilePath = $extractDir . DIRECTORY_SEPARATOR . $filePath;
            
            if (!file_exists($fullFilePath)) {
                return response()->json(['error' => 'Fichier non trouvé'], 404);
            }

            // Security check - make sure file is within the extract directory
            $realFilePath = realpath($fullFilePath);
            $realExtractDir = realpath($extractDir);
            
            if (strpos($realFilePath, $realExtractDir) !== 0) {
                return response()->json(['error' => 'Accès non autorisé'], 403);
            }

            return response()->download($fullFilePath, basename($filePath));

        } catch (\Exception $e) {
            Log::error('Error downloading DAO file:', [
                'error' => $e->getMessage(),
                'zipUrl' => $zipUrl,
                'filePath' => $filePath
            ]);
            return response()->json(['error' => 'Erreur lors du téléchargement'], 500);
        }
    }






















    public function getSousTrais()
    {
        $sousTrais = SousTrait::all();

        return response()->json($sousTrais, 200);
    }

    public function storeSousTrais(Request $request)
    {
        $validated = $request->validate([
            'nom'         => 'required|string|max:255',
            'poste'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'formation'   => 'nullable|array',
            'experience'  => 'nullable|array',
            'competences' => 'nullable|array',
            'autre'       => 'nullable|string|max:255',
        ]);

        $sousTrait = SousTrait::create([
            'nom'         => $validated['nom'],
            'poste'       => $validated['poste'],
            'description' => $validated['description'] ?? null,
            'formation'   => $validated['formation'] ?? [],
            'experience'  => $validated['experience'] ?? [],
            'competences' => $validated['competences'] ?? [],
            'autre'       => $validated['autre'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Sous Traitant ajouté avec succès.');
    }

    

   

    public function importProjetsFromCsv()
    {
        $csvPath = storage_path('app/public/projets.csv');

        if (!file_exists($csvPath)) {
            return redirect()->back()->with('error', 'Fichier CSV introuvable.');
        }

        $csv = Reader::createFromPath($csvPath, 'r');
        $csv->setHeaderOffset(0); // première ligne = noms des colonnes
        $records = $csv->getRecords();

        foreach ($records as $row) {
            ProjetNv::updateOrCreate(
                ['objet' => $row['Objet '] ?? null], // clé unique pour éviter doublons
                [
                    'organisme' => $row['Organisme '] ?? null,
                    'objet' => $row['Objet '] ?? null,
                    'ville_execution' => $row["Ville d'exécution "] ?? null,
                    'allotissement' => $row['Allotissement '] ?? null,
                    'adresse_retrait' => $row['Adresse retrait '] ?? null,
                    'contact' => $row['Contact '] ?? null,
                    'montant_retrait' => $row['Montant retrait '] ?? null,
                    'mode_paiement' => $row['Mode paiement '] ?? null,
                    'mt_caution' => $row['Montant caution '] ?? null,
                    'budget' => $row['Budget '] ?? null,
                    'visite_lieux' => $row['Visite des lieux '] ?? null,
                    'type' => $row['Type '] ?? null,
                    'observation' => $row['Obsérvation '] ?? null,
                    'soumission_electronique' => $row['Soumission électronique '] ?? null,
                    'support' => $row['Support'] ?? null,
                    'secteur' => $row['Secteur '] ?? null,
                    'telechargement' => $row['Téléchargement'] ?? null,
                    'chemin_fichiers' => [], // vide au départ
                ]
            );
        }

        return redirect()->back()->with('success', 'CSV importé avec succès.');
    }


    public function fetchResultatsBonCommande()
{
    $pythonScript = base_path('selenium_scripts/resultats_bon_commande.py');

    $lock = Cache::lock('selenium_resultat_bon_commande_lock', 300);
    if (!$lock->get()) {
        return redirect()->back()
            ->with('error', 'Une exécution Selenium est déjà en cours, réessayez dans quelques minutes.');
    }

    try {
        // Lancer le script Python en arrière-plan
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            pclose(popen("start /B python $pythonScript", "r"));
        } else {
            exec("nohup python3 $pythonScript > /dev/null 2>&1 &");
        }

        // Chemins des fichiers générés
        $csvPath = storage_path('app/public/resultats_bon_commande/resultats_bon_commande.csv');
        $jsonPath = storage_path('app/public/resultats_bon_commande/resultats_bon_commande.json');

        if (!file_exists($csvPath) || !file_exists($jsonPath)) {
            return redirect()->back()
                ->with('error', 'Fichiers CSV/JSON introuvables après exécution du script.');
        }

        // Lire le JSON pour récupérer les chemins des fichiers
        $jsonData = json_decode(file_get_contents($jsonPath), true) ?? [];
        $jsonIndex = [];
        foreach ($jsonData as $bon) {
            $objetKey = trim($bon['Objet'] ?? '');
            if ($objetKey) {
                $jsonIndex[$objetKey] = $bon;
            }
        }

        // Lire le CSV et insérer en base
        $csv = Reader::createFromPath($csvPath, 'r');
        $csv->setHeaderOffset(0);
        $records = $csv->getRecords();

        foreach ($records as $row) {
            $reference = $row['Référence'] ?? null;
            $maitre_ouvrage = $row["Maitre d'ouvrage"] ?? null;
            $objet = $row['Objet'] ?? null;
            $adjudicataire = $row['Adjudicataire'] ?? null;
            $ville = $row['Ville'] ?? null;
            $budget = $row['Budget(DHs)'] ?? null;
            $montant = $row['Montant(DHs)'] ?? null;
            $date_adjudications = $row['Date des adjudications'] ?? null;
            $date_ouverture = $row["Date d'ouverture"] ?? null;
            $date_affichage = $row["Date d'affichage"] ?? null;
            $lien_dao = $row['Lien_DAO'] ?? null;
            $dao = $row['D.A.O'] ?? null;

            $bonJson = $jsonIndex[$objet] ?? [];
            $chemin_fichiers = $bonJson['EXTRACTED_FILES'] ?? [];

            // Convertir les dates
            $date_ouverture = $date_ouverture ? Carbon::createFromFormat('d/m/Y', $date_ouverture) : null;
            $date_adjudications = $date_adjudications ? Carbon::createFromFormat('d/m/Y', $date_adjudications) : null;
            $date_affichage = $date_affichage ? Carbon::createFromFormat('d/m/Y', $date_affichage) : null;

            ResultatBonCommande::updateOrCreate(
                [
                    'reference' => $reference,
                    'objet' => $objet,
                    'maitre_ouvrage' => $maitre_ouvrage,
                ],
                [
                    'date_ouverture' => $date_ouverture,
                    'budget' => $budget,
                    'lien_dao' => $lien_dao,
                    'dao' => $dao,
                    'date_adjudications' => $date_adjudications,
                    'ville' => $ville,
                    'montant' => $montant,
                    'adjudicataire' => $adjudicataire,
                    'chemin_fichiers' => $chemin_fichiers,
                    'date_affichage' => $date_affichage,
                ]
            );
        }
    } catch (\Exception $e) {
        return redirect()->back()
            ->with('error', 'Erreur lors de l\'importation : ' . $e->getMessage());
    } finally {
        $lock->release();
    }

    return redirect()->back()
        ->with('success', 'Le script Selenium pour ResultatBonCommande a été exécuté. Les données ont été mises à jour.');
}



    public function getResultatsBonCommandeData()
    {
        $resultats = ResultatBonCommande::orderBy('date_adjudications', 'desc')->get();

        return response()->json($resultats);
    }

    // Affichage page Résultats Bon de Commande
    public function resultatsBonCommandePage()
    {
        return Inertia::render('ressources-humaines/ResultatBonCommande');
    }




































    // Add this method to your RessourcesHumainesController
public function debugImport()
{
    try {
        $csvPath = storage_path('app/public/global-marches/global-marches.csv');
        $jsonPath = storage_path('app/public/global-marches/global-marches.json');
        
        $debugInfo = [
            'files_exist' => [
                'csv' => file_exists($csvPath),
                'json' => file_exists($jsonPath)
            ],
            'file_sizes' => [
                'csv' => file_exists($csvPath) ? filesize($csvPath) : 0,
                'json' => file_exists($jsonPath) ? filesize($jsonPath) : 0
            ],
            'paths' => [
                'csv' => $csvPath,
                'json' => $jsonPath
            ]
        ];

        if (file_exists($csvPath)) {
            try {
                $csv = Reader::createFromPath($csvPath, 'r');
                $csv->setHeaderOffset(0);
                $headers = $csv->getHeader();
                $records = iterator_to_array($csv->getRecords());
                
                $debugInfo['csv_info'] = [
                    'headers' => $headers,
                    'record_count' => count($records),
                    'first_record' => count($records) > 0 ? $records[0] : null
                ];
            } catch (\Exception $e) {
                $debugInfo['csv_error'] = $e->getMessage();
            }
        }

        if (file_exists($jsonPath)) {
            try {
                $jsonContent = file_get_contents($jsonPath);
                $jsonData = json_decode($jsonContent, true);
                
                $debugInfo['json_info'] = [
                    'record_count' => count($jsonData),
                    'json_error' => json_last_error_msg(),
                    'first_record' => count($jsonData) > 0 ? $jsonData[0] : null
                ];
            } catch (\Exception $e) {
                $debugInfo['json_error'] = $e->getMessage();
            }
        }

        // Check database connection
        try {
            $count = AppelOffer::count();
            $debugInfo['database'] = [
                'connected' => true,
                'current_count' => $count,
                'last_record' => AppelOffer::latest()->first()
            ];
        } catch (\Exception $e) {
            $debugInfo['database'] = [
                'connected' => false,
                'error' => $e->getMessage()
            ];
        }

        return response()->json($debugInfo, 200);

    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
}

// Add this method to manually test the import process
public function testImportSingle()
{
    try {
        Log::info("Testing single import process");
        
        // Test with your sample data
        $testData = [
            'Référence' => '26/SDAD/2025',
            'Maitre d\'ouvrage' => 'Autres societes /SOCIETE DAKHLA AMÉNAGEMENT ET DEVELOPPEMENT',
            'Objet' => 'l\'établissement de l\'étude de conception du futur casier d\'enfouissement au CEV de Dakhla et suivi des travaux',
            'Adjudicataire' => 'ALSENTA',
            'Ville' => 'dakhla',
            'Budget(DHs)' => '468.000,00',
            'Montant(DHs)' => '412 200.00',
            'Date des adjudications' => '18/08/2025',
            'Date d\'ouverture' => '18/08/2025',
            'Date d\'affichage' => '29/09/2025',
            'Lien_DAO' => 'https://global-marches.com/downoaldcps/1484419.zip',
            'Lien_PV' => 'https://global-marches.com/downoald-pv/PV-1756828147.zip',
            'D.A.O' => null,
            'PV' => null
        ];

        $jsonIndex = [
            '26/SDAD/2025' => [
                'EXTRACTED_FILES' => [
                    '/storage/global-marches/resultat_offre_0/DCE/avis Ar Ao 26-SDAD-2025.pdf',
                    '/storage/global-marches/resultat_offre_0/DCE/Avis Fr AO 26-SDAD-2025.pdf'
                ]
            ]
        ];

        $this->processRecord($testData, $jsonIndex);

        $created = AppelOffer::where('reference', '26/SDAD/2025')->first();

        return response()->json([
            'success' => true,
            'message' => 'Test import successful',
            'created_record' => $created
        ]);

    } catch (\Exception $e) {
        Log::error("Test import failed: " . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
}

// Add these routes to your web.php
/*
Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
    '/ressources-humaines/debug-import',
    [RessourcesHumainesController::class, 'debugImport']
)->name('ressources-humaines.debug-import');

Route::middleware(['auth', 'verified', 'role:ressources-humaines'])->get(
    '/ressources-humaines/test-import-single',
    [RessourcesHumainesController::class, 'testImportSingle']
)->name('ressources-humaines.test-import-single');
*/



############################################################################################################
############################################################################################################
############################################################################################################
############################################################################################################
############################################################################################################


    public function MethodologyValidation()
    {
        $pending = MethodologyDocument::with('user:id,name,email')
            ->where('status', 'submitted')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'user_id' => $doc->user_id,
                    'user_name' => $doc->user->name,
                    'user_email' => $doc->user->email,
                    'type' => $doc->type,
                    'file_name' => $doc->file_name,
                    'file_path' => $doc->file_path,
                    'file_size' => $doc->file_size,
                    'status' => $doc->status,
                    'uploaded_at' => $doc->created_at->toISOString(),
                ];
            });

        $validated = MethodologyDocument::with(['user:id,name,email', 'validator:id,name'])
            ->where('status', 'validated')
            ->orderBy('validated_at', 'desc')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'user_id' => $doc->user_id,
                    'user_name' => $doc->user->name,
                    'user_email' => $doc->user->email,
                    'type' => $doc->type,
                    'file_name' => $doc->file_name,
                    'file_path' => $doc->file_path,
                    'file_size' => $doc->file_size,
                    'status' => $doc->status,
                    'uploaded_at' => $doc->created_at->toISOString(),
                    'validated_at' => $doc->validated_at?->toISOString(),
                    'validator_comment' => $doc->validator_comment,
                ];
            });

        $rejected = MethodologyDocument::with(['user:id,name,email', 'validator:id,name'])
            ->where('status', 'rejected')
            ->orderBy('validated_at', 'desc')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'user_id' => $doc->user_id,
                    'user_name' => $doc->user->name,
                    'user_email' => $doc->user->email,
                    'type' => $doc->type,
                    'file_name' => $doc->file_name,
                    'file_path' => $doc->file_path,
                    'file_size' => $doc->file_size,
                    'status' => $doc->status,
                    'uploaded_at' => $doc->created_at->toISOString(),
                    'validated_at' => $doc->validated_at?->toISOString(),
                    'validator_comment' => $doc->validator_comment,
                ];
            });

        $pendingDocs = MethodologyDocument::where('status', 'submitted')->get();
        $urgentDocs = $pendingDocs->filter(function ($doc) {
            return $doc->created_at->diffInDays(now()) >= 3;
        });

        $stats = [
            'total_pending' => $pendingDocs->count(),
            'total_validated' => MethodologyDocument::where('status', 'validated')->count(),
            'total_rejected' => MethodologyDocument::where('status', 'rejected')->count(),
            'pending_urgent' => $urgentDocs->count(),
        ];

        return Inertia::render('ressources-humaines/MethodologyValidation', [
            'documents' => [
                'pending' => $pending,
                'validated' => $validated,
                'rejected' => $rejected,
            ],
            'stats' => $stats,
        ]);
    }

    public function validateMethodology(Request $request)
    {
        $data = $request->validate([
            'document_id' => 'required|exists:methodology_documents,id',
            'action' => 'required|in:validate,reject',
            'comment' => 'nullable|string|max:1000',
        ]);

        try {
            $document = MethodologyDocument::findOrFail($data['document_id']);

            if ($document->status !== 'submitted') {
                return redirect()->back()->withErrors(['message' => 'Ce document a déjà été traité.']);
            }

            $document->update([
                'status' => $data['action'] === 'validate' ? 'validated' : 'rejected',
                'validator_id' => auth()->id(),
                'validator_comment' => $data['comment'],
                'validated_at' => now(),
            ]);

            Log::info('Document validation updated', [
                'document_id' => $document->id,
                'action' => $data['action'],
                'validator_id' => auth()->id(),
            ]);

            $this->notifyDocumentOwner($document, $data['action'], $data['comment']);

            $message = $data['action'] === 'validate' 
                ? 'Document validé avec succès! Le fournisseur a été notifié.' 
                : 'Document rejeté. Le fournisseur a été notifié.';

            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Error validating document', [
                'error' => $e->getMessage(),
                'document_id' => $data['document_id'] ?? null,
            ]);

            return redirect()->back()->withErrors(['error' => 'Erreur lors de la validation du document.']);
        }
    }

    public function downloadMethodology(MethodologyDocument $document)
    {
        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    protected function notifyDocumentOwner(MethodologyDocument $document, string $action, ?string $comment)
    {
        try {
            $owner = $document->user;

            $owner->notify(new MethodologyDocumentNotification(
                $document,
                $action === 'validate' ? 'validated' : 'rejected',
                $comment
            ));

            Log::info('Document owner notified', [
                'owner_id' => $owner->id,
                'document_id' => $document->id,
                'action' => $action,
            ]);

            $lastNotification = DatabaseNotification::where('notifiable_id', $owner->id)
                ->where('notifiable_type', User::class)
                ->latest()
                ->first();

            if ($lastNotification) {
                try {
                    broadcast(new NewNotification($lastNotification, $owner->id))->toOthers();
                } catch (\Exception $e) {
                    Log::warning('Broadcasting failed', ['error' => $e->getMessage()]);
                }
            }

        } catch (\Exception $e) {
            Log::error('Error notifying document owner', [
                'error' => $e->getMessage(),
                'document_id' => $document->id,
            ]);
        }
    }


    public function References()
    {
        $references = Reference::with('user')
            ->orderBy('submitted_at', 'desc')
            ->get();

        $stats = [
            'total' => $references->count(),
            'pending' => $references->where('status', 'pending')->count(),
            'validated' => $references->where('status', 'validated')->count(),
            'rejected' => $references->where('status', 'rejected')->count(),
        ];

        return Inertia::render('ressources-humaines/References', [
            'references' => $references,
            'stats' => $stats
        ]);
    }

    /**
     * Show single reference details
     */
    public function showReference($id)
    {
        $reference = Reference::with('user', 'validator')->findOrFail($id);

        return Inertia::render('ressources-humaines/ReferenceDetails', [
            'reference' => $reference
        ]);
    }

    /**
     * Validate or reject a reference
     */
    public function validateReference(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:validated,rejected',
                'validation_comment' => 'nullable|string|max:1000',
            ]);

            // Require comment for rejection
            if ($validated['status'] === 'rejected' && empty($validated['validation_comment'])) {
                return back()->withErrors([
                    'validation_comment' => 'Un commentaire est requis pour rejeter une référence.'
                ]);
            }

            $reference = Reference::with('user')->findOrFail($id);

            Log::info('Validating reference', [
                'reference_id' => $id,
                'status' => $validated['status'],
                'validator_id' => auth()->id(),
                'supplier_id' => $reference->user_id
            ]);

            // Update reference status
            $reference->update([
                'status' => $validated['status'],
                'validation_comment' => $validated['validation_comment'],
                'validated_at' => now(),
                'validated_by' => auth()->id(),
            ]);

            // Get the submitter (supplier)
            $submitter = $reference->user;

            // ========================================
            // NOTIFY THE SUPPLIER
            // ========================================
            try {
                if ($validated['status'] === 'validated') {
                    $submitter->notify(new ReferenceValidatedNotification($reference));
                    $message = 'Référence validée avec succès.';
                } else {
                    $submitter->notify(new ReferenceRejectedNotification($reference));
                    $message = 'Référence rejetée.';
                }

                // Get the latest notification for the submitter
                $notification = $submitter->notifications()->latest()->first();
                
                if ($notification) {
                    // Broadcast notification to the supplier
                    broadcast(new NewNotification($notification, $submitter->id))->toOthers();
                    
                    Log::info('Notification sent to supplier', [
                        'supplier_id' => $submitter->id,
                        'supplier_name' => $submitter->name,
                        'notification_type' => $validated['status'],
                        'notification_id' => $notification->id
                    ]);
                } else {
                    Log::warning('Failed to retrieve notification after creation', [
                        'supplier_id' => $submitter->id
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to notify supplier', [
                    'supplier_id' => $submitter->id,
                    'error' => $e->getMessage()
                ]);
            }

            return redirect()
                ->route('ressources-humaines.references.index')
                ->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            return back()->withErrors($e->errors());
            
        } catch (\Exception $e) {
            Log::error('Reference validation failed', [
                'message' => $e->getMessage(),
                'reference_id' => $id,
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return back()->withErrors([
                'error' => 'Une erreur est survenue lors de la validation.'
            ]);
        }
    }

    /**
     * Download reference document (RH side)
     */
    public function downloadReferenceDocument($id)
    {
        $reference = Reference::findOrFail($id);

        $filePath = storage_path('app/public/' . $reference->document_path);

        if (!file_exists($filePath)) {
            abort(404, 'Document non trouvé');
        }

        return response()->download($filePath, $reference->document_name);
    }


###################################################################################################
###################################################################################################
###################################################################################################
###################################################################################################
###################################################################################################





    public function indexEntretiens()
    {
        $entretiens = Entretien::with(['salarie' => function($query) {
                $query->select('id', 'nom', 'prenom', 'email', 'poste', 'telephone', 'date_embauche');
            }])
            ->orderBy('date_entretien', 'desc')
            ->get()
            ->map(function ($entretien) {
                return [
                    'id' => $entretien->id,
                    'salarie' => $entretien->salarie,
                    'poste_vise' => $entretien->poste_vise,
                    'date_entretien' => $entretien->date_entretien->format('Y-m-d'),
                    'date_entretien_formatted' => $entretien->date_entretien->format('d/m/Y'),
                    'type_entretien' => $entretien->type_entretien,
                    'type_entretien_libelle' => $entretien->type_entretien_libelle,
                    'evaluateur_principal' => $entretien->evaluateur_principal,
                    'score_total' => $entretien->score_total,
                    'pourcentage_score' => $entretien->pourcentage_score,
                    'appreciation' => $entretien->appreciation,
                    'couleur_score' => $entretien->couleur_score,
                    'statut' => $entretien->statut,
                    'statut_libelle' => $entretien->statut_libelle,
                    'created_at' => $entretien->created_at->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('ressources-humaines/Entretien', [
            'entretiens' => $entretiens,
        ]);
    }

    /**
     * Affiche le formulaire de création d'entretien
     */
    public function createEntretien()
    {
        $salaries = Salarie::select('id', 'nom', 'prenom', 'poste', 'email', 'telephone', 'date_embauche')
            ->orderBy('nom')
            ->get()
            ->map(function ($salarie) {
                return [
                    'id' => $salarie->id,
                    'nom' => $salarie->nom,
                    'prenom' => $salarie->prenom,
                    'nom_complet' => $salarie->nom_complet ?? "{$salarie->prenom} {$salarie->nom}",
                    'poste' => $salarie->poste,
                    'email' => $salarie->email,
                    'telephone' => $salarie->telephone,
                    'date_embauche' => $salarie->date_embauche,
                ];
            });

        return Inertia::render('ressources-humaines/CreateEntretien', [
            'salaries' => $salaries,
        ]);
    }

    /**
     * Enregistre un nouvel entretien
     */
    public function storeEntretien(Request $request)
    {
        Log::info('📝 Starting entretien creation', [
            'salarie_id' => $request->salarie_id,
            'has_files' => [
                'contrat_cdi' => $request->hasFile('contrat_cdi'),
                'cv' => $request->hasFile('cv'),
                'diplome' => $request->hasFile('diplome'),
                'certificat_travail' => $request->hasFile('certificat_travail'),
            ]
        ]);

        try {
            // Validation
            $validated = $request->validate([
                // Entretien data
                'salarie_id' => 'required|exists:salaries,id',
                'poste_vise' => 'required|string|max:255',
                'date_entretien' => 'required|date',
                'type_entretien' => 'required|in:premier,technique,final',
                'evaluateur_principal' => 'required|string|max:255',
                'expert_technique' => 'nullable|string|max:255',
                'responsable_rh' => 'nullable|string|max:255',
                
                // Scores
                'scores_techniques' => 'required|array',
                'scores_comportementaux' => 'required|array',
                'scores_adequation' => 'required|array',
                
                // Observations
                'points_forts' => 'nullable|string',
                'points_vigilance' => 'nullable|string',
                'recommandation' => 'required|in:fortement_recommande,recommande,reserve,non_recommande',
                
                // Documents
                'contrat_cdi' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
                'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
                'diplome' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
                'certificat_travail' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            ]);

            Log::info('✅ Validation passed');

            // Get salarie
            $salarie = Salarie::findOrFail($validated['salarie_id']);
            Log::info('✅ Salarie found', ['id' => $salarie->id, 'nom' => $salarie->nom_complet]);

            // Handle file uploads
            if ($request->hasFile('contrat_cdi')) {
                if ($salarie->contrat_cdi_path && Storage::disk('public')->exists($salarie->contrat_cdi_path)) {
                    Storage::disk('public')->delete($salarie->contrat_cdi_path);
                }
                $file = $request->file('contrat_cdi');
                $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) 
                          . '_' . now()->format('Ymd_His') 
                          . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('documents/contrats', $filename, 'public');
                $salarie->contrat_cdi_path = $path;
                Log::info('📄 Uploaded contrat_cdi', ['path' => $path]);
            }

            if ($request->hasFile('cv')) {
                if ($salarie->cv_path && Storage::disk('public')->exists($salarie->cv_path)) {
                    Storage::disk('public')->delete($salarie->cv_path);
                }
                $file = $request->file('cv');
                $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) 
                          . '_' . now()->format('Ymd_His') 
                          . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('documents/cvs', $filename, 'public');
                $salarie->cv_path = $path;
                Log::info('📄 Uploaded cv', ['path' => $path]);
            }

            if ($request->hasFile('diplome')) {
                if ($salarie->diplome_path && Storage::disk('public')->exists($salarie->diplome_path)) {
                    Storage::disk('public')->delete($salarie->diplome_path);
                }
                $file = $request->file('diplome');
                $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) 
                          . '_' . now()->format('Ymd_His') 
                          . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('documents/diplomes', $filename, 'public');
                $salarie->diplome_path = $path;
                Log::info('📄 Uploaded diplome', ['path' => $path]);
            }

            if ($request->hasFile('certificat_travail')) {
                if ($salarie->certificat_travail_path && Storage::disk('public')->exists($salarie->certificat_travail_path)) {
                    Storage::disk('public')->delete($salarie->certificat_travail_path);
                }
                $file = $request->file('certificat_travail');
                $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) 
                          . '_' . now()->format('Ymd_His') 
                          . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('documents/certificats', $filename, 'public');
                $salarie->certificat_travail_path = $path;
                Log::info('📄 Uploaded certificat_travail', ['path' => $path]);
            }

            $salarie->save();
            Log::info('💾 Salarie saved with documents');

            // Calculate scores
            $poids = [
                'techniques' => [
                    'formation_certifications' => 3,
                    'maitrise_logiciels' => 4,
                    'expertise_technique' => 4,
                    'connaissance_marche' => 3,
                    'gestion_projets' => 3,
                    'innovation_veille' => 3,
                ],
                'comportementaux' => [
                    'communication_redaction' => 3,
                    'travail_equipe' => 2,
                    'rigueur_precision' => 3,
                    'gestion_stress' => 2,
                    'autonomie_initiative' => 2,
                ],
                'adequation' => [
                    'motivation_engagement' => 2,
                    'disponibilite_mobilite' => 2,
                    'potentiel_evolution' => 2,
                    'connaissance_entreprise' => 2,
                ],
            ];

            $scoreTechnique = $this->calculateScore($validated['scores_techniques'], $poids['techniques']);
            $scoreComportemental = $this->calculateScore($validated['scores_comportementaux'], $poids['comportementaux']);
            $scoreAdequation = $this->calculateScore($validated['scores_adequation'], $poids['adequation']);
            $scoreTotal = $scoreTechnique + $scoreComportemental + $scoreAdequation;

            Log::info('Scores calculated', [
                'technique' => $scoreTechnique,
                'comportemental' => $scoreComportemental,
                'adequation' => $scoreAdequation,
                'total' => $scoreTotal,
            ]);

            // Create entretien
            $entretien = Entretien::create([
                'salarie_id' => $validated['salarie_id'],
                'poste_vise' => $validated['poste_vise'],
                'date_entretien' => $validated['date_entretien'],
                'type_entretien' => $validated['type_entretien'],
                'evaluateur_principal' => $validated['evaluateur_principal'],
                'expert_technique' => $validated['expert_technique'],
                'responsable_rh' => $validated['responsable_rh'],
                'scores_techniques' => $validated['scores_techniques'],
                'scores_comportementaux' => $validated['scores_comportementaux'],
                'scores_adequation' => $validated['scores_adequation'],
                'score_technique' => $scoreTechnique,
                'score_comportemental' => $scoreComportemental,
                'score_adequation' => $scoreAdequation,
                'score_total' => $scoreTotal,
                'points_forts' => $validated['points_forts'],
                'points_vigilance' => $validated['points_vigilance'],
                'recommandation' => $validated['recommandation'],
                'statut' => 'en_attente_validation',
            ]);

            Log::info('✅ Entretien created', [
                'id' => $entretien->id,
                'statut' => $entretien->statut,
            ]);

            // Notify Direction Générale
            $directeurs = User::role('admin')->get();
            
            if ($directeurs->isEmpty()) {
                Log::warning('⚠️ No Direction Générale users found');
            } else {
                foreach ($directeurs as $directeur) {
                    try {
                        $directeur->notify(new \App\Notifications\EntretienValidationNotification($entretien));
                        Log::info('📧 Notification sent', ['user' => $directeur->name]);
                    } catch (\Exception $e) {
                        Log::error('❌ Notification failed', [
                            'user' => $directeur->name,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }

            return redirect()
                ->route('entretiens.index')
                ->with('success', 'Évaluation créée et envoyée pour validation.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ Validation failed', ['errors' => $e->errors()]);
            throw $e;
            
        } catch (\Exception $e) {
            Log::error('❌ Error creating entretien', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Erreur: ' . $e->getMessage());
        }
    }

    /**
     * Affiche les détails d'un entretien
     */
    public function showEntretien(Entretien $entretien)
{
    $entretien->load(['salarie' => function($query) {
        $query->select('id', 'nom', 'prenom', 'email', 'poste', 'telephone', 'date_embauche', 
                       'contrat_cdi_path', 'cv_path', 'diplome_path', 'certificat_travail_path');
    }]);

    // Get documents from salarie
    $documents = [
        'contrat_cdi' => $entretien->salarie->contrat_cdi_path ? [
            'path' => $entretien->salarie->contrat_cdi_path,
            'url' => Storage::url($entretien->salarie->contrat_cdi_path),
            'exists' => Storage::exists($entretien->salarie->contrat_cdi_path),
        ] : null,
        'cv' => $entretien->salarie->cv_path ? [
            'path' => $entretien->salarie->cv_path,
            'url' => Storage::url($entretien->salarie->cv_path),
            'exists' => Storage::exists($entretien->salarie->cv_path),
        ] : null,
        'diplome' => $entretien->salarie->diplome_path ? [
            'path' => $entretien->salarie->diplome_path,
            'url' => Storage::url($entretien->salarie->diplome_path),
            'exists' => Storage::exists($entretien->salarie->diplome_path),
        ] : null,
        'certificat_travail' => $entretien->salarie->certificat_travail_path ? [
            'path' => $entretien->salarie->certificat_travail_path,
            'url' => Storage::url($entretien->salarie->certificat_travail_path),
            'exists' => Storage::exists($entretien->salarie->certificat_travail_path),
        ] : null,
    ];

    $data = [
        'id' => $entretien->id,
        'salarie' => $entretien->salarie,
        'poste_vise' => $entretien->poste_vise,
        'date_entretien' => $entretien->date_entretien->format('Y-m-d'),
        'date_entretien_formatted' => $entretien->date_entretien->format('d/m/Y'),
        'type_entretien' => $entretien->type_entretien,
        'type_entretien_libelle' => $entretien->type_entretien_libelle,
        'evaluateur_principal' => $entretien->evaluateur_principal,
        'expert_technique' => $entretien->expert_technique,
        'responsable_rh' => $entretien->responsable_rh,
        'scores_techniques' => $entretien->scores_techniques,
        'scores_comportementaux' => $entretien->scores_comportementaux,
        'scores_adequation' => $entretien->scores_adequation,
        'score_technique' => $entretien->score_technique,
        'score_comportemental' => $entretien->score_comportemental,
        'score_adequation' => $entretien->score_adequation,
        'score_total' => $entretien->score_total,
        'pourcentage_score' => $entretien->pourcentage_score,
        'appreciation' => $entretien->appreciation,
        'couleur_score' => $entretien->couleur_score,
        'points_forts' => $entretien->points_forts,
        'points_vigilance' => $entretien->points_vigilance,
        'recommandation' => $entretien->recommandation,
        'statut' => $entretien->statut,
        'statut_libelle' => $entretien->statut_libelle,
        'documents' => $documents,
        'created_at' => $entretien->created_at->format('d/m/Y H:i'),
        'updated_at' => $entretien->updated_at->format('d/m/Y H:i'),
    ];

    return Inertia::render('ressources-humaines/DetailEntretien', [
        'entretien' => $data,
    ]);
}


    /**
     * Met à jour un entretien
     */
    public function updateEntretien(Request $request, Entretien $entretien)
    {
        $validated = $request->validate([
            'statut' => 'nullable|in:en_cours,complete,validee',
            'recommandation' => 'nullable|string',
        ]);

        $entretien->update($validated);

        return redirect()
            ->back()
            ->with('success', 'Entretien mis à jour avec succès');
    }

    /**
     * Supprime un entretien
     */
    public function destroyEntretien(Entretien $entretien)
    {
        $entretien->delete();

        return redirect()
            ->route('entretiens.index')
            ->with('success', 'Entretien supprimé avec succès');
    }

    /**
     * Calcule le score pondéré
     */
    private function calculateScore(array $scores, array $weights): float
    {
        $total = 0;
        foreach ($scores as $key => $value) {
            $weight = $weights[$key] ?? 1;
            $note = $value['note'] ?? 0;
            $total += ($note * $weight / 5);
        }
        return round($total, 2);
    }

        public function exportEntretien(Entretien $entretien)
    {
        $entretien->load(['salarie' => function($query) {
            $query->select('id', 'nom', 'prenom', 'email', 'poste', 'telephone', 'date_embauche');
        }]);

        return Inertia::render('ressources-humaines/ExportEntretienPDF', [
            'entretien' => [
                'id' => $entretien->id,
                'salarie' => $entretien->salarie,
                'poste_vise' => $entretien->poste_vise,
                'date_entretien' => $entretien->date_entretien->format('Y-m-d'),
                'date_entretien_formatted' => $entretien->date_entretien->format('d/m/Y'),
                'type_entretien' => $entretien->type_entretien,
                'type_entretien_libelle' => $entretien->type_entretien_libelle,
                'evaluateur_principal' => $entretien->evaluateur_principal,
                'expert_technique' => $entretien->expert_technique,
                'responsable_rh' => $entretien->responsable_rh,
                'scores_techniques' => $entretien->scores_techniques,
                'scores_comportementaux' => $entretien->scores_comportementaux,
                'scores_adequation' => $entretien->scores_adequation,
                'score_technique' => $entretien->score_technique,
                'score_comportemental' => $entretien->score_comportemental,
                'score_adequation' => $entretien->score_adequation,
                'score_total' => $entretien->score_total,
                'pourcentage_score' => $entretien->pourcentage_score,
                'appreciation' => $entretien->appreciation,
                'points_forts' => $entretien->points_forts,
                'points_vigilance' => $entretien->points_vigilance,
                'recommandation' => $entretien->recommandation,
                'statut' => $entretien->statut,
                'statut_libelle' => $entretien->statut_libelle,
                'created_at' => $entretien->created_at->format('d/m/Y'),
            ],
        ]);
    }

    public function downloadDocument(Entretien $entretien, string $type)
{
    $salarie = $entretien->salarie;
    
    // Map type to the correct field name
    $pathField = match($type) {
        'contrat_cdi' => 'contrat_cdi_path',
        'cv' => 'cv_path',
        'diplome' => 'diplome_path',
        'certificat_travail' => 'certificat_travail_path',
        default => null,
    };
    
    if (!$pathField) {
        return redirect()->back()->with('error', 'Type de document invalide');
    }
    
    $path = $salarie->$pathField;
    
    if (!$path || !Storage::exists($path)) {
        \Log::error('Document not found', [
            'type' => $type,
            'path' => $path,
            'salarie_id' => $salarie->id,
        ]);
        return redirect()->back()->with('error', 'Document non trouvé');
    }
    
    $filename = basename($path);
    return Storage::download($path, $filename);
}

    
############################################################################################################
############################################################################################################
############################################################################################################
############################################################################################################
############################################################################################################



public function profilsDemandes()
    {
        $demandes = DemandeProfil::with(['demandeur', 'details', 'traitePar'])
            ->latest()
            ->get();

        $projets = Projet::select('id', 'nom', 'client', 'statut')
            ->where('statut', '!=', 'termine')
            ->orderBy('nom')
            ->get();

        return Inertia::render('ressources-humaines/ProfilsDemandes', [
            'demandes' => $demandes,
            'projets' => $projets,
        ]);
    }

    public function updateStatutDemande(Request $request, DemandeProfil $demande)
    {
        $validated = $request->validate([
            'statut' => 'required|in:en_attente,en_cours,validee,refusee,completee',
            'commentaire_rh' => 'nullable|string',
        ]);

        $demande->update([
            'statut' => $validated['statut'],
            'commentaire_rh' => $validated['commentaire_rh'] ?? $demande->commentaire_rh,
            'traite_par' => auth()->id(),
            'traite_le' => now(),
        ]);

        return redirect()->back()->with('success', 'Statut de la demande mis à jour avec succès');
    }

    public function searchProfils(Request $request)
    {
        $validated = $request->validate([
            'categorie_profil' => 'required|string',
            'poste_profil' => 'required|string',
            'niveau_experience' => 'required|string',
        ]);

        $profils = Profil::with(['salarie' => function ($query) {
                $query->select('id', 'nom', 'prenom', 'email', 'poste', 'statut');
            }])
            ->where('categorie_profil', $validated['categorie_profil'])
            ->where('poste_profil', $validated['poste_profil'])
            ->where('niveau_experience', $validated['niveau_experience'])
            ->where('actif', true)
            ->whereHas('salarie', function ($query) {
                $query->where('statut', 'actif');
            })
            ->get()
            ->map(function ($profil) {
                return [
                    'id' => $profil->id,
                    'salarie' => [
                        'id' => $profil->salarie->id,
                        'nom' => $profil->salarie->nom,
                        'prenom' => $profil->salarie->prenom,
                        'email' => $profil->salarie->email,
                        'poste' => $profil->salarie->poste,
                        'statut' => $profil->salarie->statut,
                    ],
                    'categorie_profil' => $profil->categorie_profil,
                    'poste_profil' => $profil->poste_profil,
                    'niveau_experience' => $profil->niveau_experience,
                    'competences_techniques' => $profil->competences_techniques ?? [],
                    'actif' => $profil->actif,
                ];
            });

        return Inertia::render('ressources-humaines/ProfilsDemandes', [
            'demandes' => DemandeProfil::with(['demandeur', 'details', 'traitePar'])->latest()->get(),
            'projets' => Projet::select('id', 'nom', 'client', 'statut')
                ->where('statut', '!=', 'termine')
                ->orderBy('nom')
                ->get(),
            'availableProfils' => $profils,
        ]);
    }

    public function assignToProject(Request $request)
    {
        $validated = $request->validate([
            'demande_id' => 'required|exists:demandes_profils,id',
            'projet_id' => 'required|exists:projets,id',
            'profil_ids' => 'required|array',
            'profil_ids.*' => 'exists:profils,id',
        ]);

        DB::beginTransaction();
        try {
            $projet = Projet::findOrFail($validated['projet_id']);
            $demande = DemandeProfil::findOrFail($validated['demande_id']);
            
            // Get all salarie IDs from the selected profils
            $profils = Profil::with('salarie')
                ->whereIn('id', $validated['profil_ids'])
                ->get();

            $salarieIds = $profils->pluck('salarie.id')->filter()->toArray();

            // Get current salarie_ids from project
            $currentSalarieIds = $projet->salarie_ids ?? [];
            
            // Merge with new salarie IDs (avoid duplicates)
            $updatedSalarieIds = array_unique(array_merge($currentSalarieIds, $salarieIds));

            // Update project with new salarie_ids
            $projet->update([
                'salarie_ids' => $updatedSalarieIds,
            ]);

            // Also sync via the pivot table if you're using belongsToMany
            if (method_exists($projet, 'salaries')) {
                $projet->salaries()->syncWithoutDetaching($salarieIds);
            }

            // Update demande status to en_cours if it was en_attente
            if ($demande->statut === 'en_attente') {
                $demande->update([
                    'statut' => 'en_cours',
                    'traite_par' => auth()->id(),
                    'traite_le' => now(),
                ]);
            }

            // Create notification or log entry (optional)
            // You can add a notification to the demandeur that profils have been assigned

            DB::commit();

            return redirect()->back()->with('success', count($salarieIds) . ' profil(s) assigné(s) au projet avec succès');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de l\'assignation: ' . $e->getMessage());
        }
    }

#######################################################################################################
#######################################################################################################
#######################################################################################################
#######################################################################################################

    public function CNSSDocuments()
    {
        return Inertia::render('ressources-humaines/CNSSDocuments');
    }

    public function ContractsDeclarations()
    {
        return Inertia::render('ressources-humaines/ContractsDeclarations');
    }

    public function CVsDiplomas()
    {
        return Inertia::render('ressources-humaines/CVsDiplomas');
    }

    public function TeamValidation()
    {
        return Inertia::render('ressources-humaines/TeamValidation');
    }

















}