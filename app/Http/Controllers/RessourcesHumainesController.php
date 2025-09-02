<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Projet;
use App\Models\User;
use App\Models\Vehicule;
use App\Models\Materiel;
use App\Models\Salarie;
use App\Models\Progression;
use App\Models\Profil;
use App\Mail\WelcomeEmployeeMail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\hash;
use Illuminate\Support\Facades\Mail;


use Inertia\Inertia;

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


public function affecterProjets(Request $request, Salarie $salarie)
{
    try {
        $validated = $request->validate([
            'projet_ids' => 'required|array|min:1',
            'projet_ids.*' => 'exists:projets,id'
        ]);

        $salarie->projets()->sync($validated['projet_ids']);

        \Log::info('Projects assigned successfully', [
            'salarie_id' => $salarie->id,
            'salarie_name' => $salarie->user->name ?? 'Unknown',
            'projet_ids' => $validated['projet_ids'],
            'project_count' => count($validated['projet_ids'])
        ]);

        return redirect()->back()->with('success', 'Projets affectés avec succès');
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validation error in affecterProjets', [
            'errors' => $e->errors(),
            'salarie_id' => $salarie->id,
            'input' => $request->all()
        ]);
        
        return redirect()->back()
            ->withErrors($e->errors())
            ->withInput();
            
    } catch (\Exception $e) {
        \Log::error('Error assigning projects', [
            'message' => $e->getMessage(),
            'salarie_id' => $salarie->id,
            'trace' => $e->getTraceAsString(),
            'input' => $request->all()
        ]);
        
        return redirect()->back()
            ->with('error', 'Erreur lors de l\'affectation des projets: ' . $e->getMessage());
    }
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

        $projet = Projet::create($validated);

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

            $profil = Profil::create([
                'user_id'      => $salarie->id,
                'nom_profil'   => $validatedData['nom_profil'],
                'poste_profil' => $validatedData['poste_profil'],
            ]);

            Log::info('Salarie created', ['salarie' => $salarie->toArray()]);
            Log::info('Profil created',  ['profil'  => $profil->toArray()]);

            return redirect()->back()->with([
                'success' => 'Employé créé avec succès.',
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


public function access() 
{
    $users = User::role('salarie')
        ->with('roles')
        ->orderBy('created_at', 'desc')
        ->get();

    // Load salaries with their many-to-many projects relationship
    $salaries = Salarie::with(['user', 'projets'])
        ->orderBy('created_at', 'desc')
        ->get();

    // Get all projects for the assignment dialog
    $projets = Projet::orderBy('nom', 'asc')->get();

    return Inertia::render('ressources-humaines/Access', [
        'users' => $users,
        'salaries' => $salaries,
        'projets' => $projets, // This was missing in your original method
    ]);
}

public function storeAccess(Request $request)
{
    try {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'required|string|max:255',
            'password' => 'required|string|min:6',
            'poste' => 'nullable|string|max:255',
            'salaire_mensuel' => 'nullable|numeric|min:0',
            'date_embauche' => 'nullable|date',
            'statut' => 'nullable|in:actif,inactif,conge,demission',
        ]);

        // Store the plain password before hashing
        $plainPassword = $validated['password'];

        $user = User::create([
            'name' => $validated['prenom'] . ' ' . $validated['nom'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        $user->assignRole('salarie');

        $salarie = Salarie::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'telephone' => $validated['telephone'],
            'poste' => $validated['poste'] ?? null,
            'salaire_mensuel' => $validated['salaire_mensuel'] ?? null,
            'date_embauche' => $validated['date_embauche'] ?? null,
            'statut' => $validated['statut'] ?? 'actif',
            'user_id' => $user->id,
        ]);

        return redirect()->back()->with('success', 'Profile créé avec succès.');

    } catch (\Exception $e) {
        \Log::error('Error storing access', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'input' => $request->all()
        ]);
        
        return redirect()->back()
            ->with('error', 'Erreur lors de la création de profile: ' . $e->getMessage());
    }
}

public function updateAccess(Request $request, User $user)
{
    try {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'telephone' => 'required|string|max:255',
            'password' => 'nullable|string|min:6',
            'poste' => 'nullable|string|max:255',
            'salaire_mensuel' => 'nullable|numeric|min:0',
            'date_embauche' => 'nullable|date',
            'statut' => 'nullable|in:actif,inactif,conge,demission',
        ]);

        $userData = [
            'name' => $validated['prenom'] . ' ' . $validated['nom'],
            'email' => $validated['email'],
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = bcrypt($validated['password']);
        }

        $user->update($userData);

        $salarie = Salarie::where('user_id', $user->id)->first();
        
        $salarieData = [
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'telephone' => $validated['telephone'],
            'poste' => $validated['poste'] ?? null,
            'salaire_mensuel' => $validated['salaire_mensuel'] ?? null,
            'date_embauche' => $validated['date_embauche'] ?? null,
            'statut' => $validated['statut'] ?? 'actif',
            'user_id' => $user->id,
        ];

        if ($salarie) {
            $salarie->update($salarieData);
        } else {
            Salarie::create($salarieData);
        }

        return redirect()->back()->with('success', 'Profile mis à jour avec succès.');

    } catch (\Exception $e) {
        \Log::error('Error updating access', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'input' => $request->all()
        ]);
        
        return redirect()->back()
            ->with('error', 'Erreur lors de la mise à jour de profile: ' . $e->getMessage());
    }
}


public function destroyAccess(User $user)
{
    try {
        Salarie::where('user_id', $user->id)->delete();
        
        $user->delete();
        
        return redirect()->back()->with('success', 'Profile supprimé avec succès.');
    } catch (\Exception $e) {
        Log::error('Erreur suppression profile:', [
            'message' => $e->getMessage(),
            'user_id' => $user->id
        ]);
        return redirect()->back()->with('error', 'Erreur lors de la suppression de profile.');
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
}