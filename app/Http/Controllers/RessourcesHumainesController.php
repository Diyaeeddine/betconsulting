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
use App\Models\Formation;
use App\Models\SousTrait;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\hash;
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
        $projetsFromDB = Projet::with(['responsable'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        $dynamicTrackingPoints = $projetsFromDB->map(function ($projet, $index) {
            // Récupérer les salariés basés sur salarie_ids du projet
            $salarieIds = $projet->salarie_ids ?? [];
            if (is_string($salarieIds)) {
                $salarieIds = json_decode($salarieIds, true) ?? [];
            }

            $employees = [];
            if (!empty($salarieIds)) {
                $salaries = Salarie::whereIn('id', $salarieIds)->get();
                $employees = $salaries->map(function ($salarie) {
                    return [
                        'id' => $salarie->id,
                        'name' => trim($salarie->nom . ' ' . $salarie->prenom),
                        'nom' => $salarie->nom,
                        'prenom' => $salarie->prenom,
                        'role' => $salarie->poste ?? 'Employé',
                        'email' => $salarie->email,
                        'telephone' => $salarie->telephone,
                        'salaire_mensuel' => $salarie->salaire_mensuel,
                        'date_embauche' => $salarie->date_embauche,
                        'statut' => $salarie->statut
                    ];
                })->toArray();
            }

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
                'employees' => $employees,
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
        // Récupérer les progressions associées au projet
        $progressions = $projet->progressions()->orderBy('date_validation', 'asc')->get();

        // Si aucune progression, on retourne un tableau vide
        if ($progressions->isEmpty()) {
            return [];
        }

        $timeline = [];

        foreach ($progressions as $progression) {
            $timeline[] = [
                'status' => ucfirst($progression->statut), // statut : ex. 'en route', 'exécution'
                'time' => $progression->date_validation
                    ? date('d M, H:i', strtotime($progression->date_validation))
                    : 'Non défini',
                'description' => $progression->description_progress ?? 'Aucune description',
                'completed' => $progression->pourcentage == 100,
                'current' => $progression->pourcentage < 100 && $progression->pourcentage > 0,
                'pourcentage' => $progression->pourcentage,
                'commentaire' => $progression->commentaire,
                'valide_par' => $progression->validePar ? $progression->validePar->name : 'Non validé',
            ];
        }

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
        $progressions = Progression::with(['projet', 'validePar' => function ($query) {
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
                'progress_file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif,txt,xlsx,xls|max:10240', // Max 10MB
                'statut' => 'required|in:valide,en_attente,rejete', // Correspond à la migration
                'date_validation' => 'nullable|date',
                'pourcentage' => 'required|numeric|min:0|max:100',
                'commentaire' => 'nullable|string|max:1000',
                'valide_par' => 'nullable|exists:users,id',
            ]);

            // Gestion de l'upload du fichier
            if ($request->hasFile('progress_file')) {
                // Supprimer l'ancien fichier s'il existe
                if ($progression->progress && Storage::disk('public')->exists($progression->progress)) {
                    Storage::disk('public')->delete($progression->progress);
                }

                $file = $request->file('progress_file');

                // Nettoyer le nom du fichier pour éviter les problèmes
                $originalName = $file->getClientOriginalName();
                $cleanName = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $originalName);
                $fileName = time() . '_' . $cleanName;

                // Stocker le nouveau fichier
                $filePath = $file->storeAs('progress-files', $fileName, 'public');

                $validated['progress'] = $filePath;
            }

            // Supprimer progress_file des données validées
            unset($validated['progress_file']);

            // Convertir les valeurs vides en null
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
            // Supprimer le fichier associé s'il existe
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

        // Validation conditionnelle
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

        // Validation conditionnelle
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

        // Validation conditionnelle
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

        // Validation conditionnelle
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
        // Get all projects
        $projects = Projet::select('id', 'nom')->get();

        // Get all users and eager load their profils and vehicules
        $users = Salarie::with(['profils', 'vehicule'])->get();

        // Add projects_count, profil_string, and attach vehicule
        $users->transform(function ($user) {
            // Projects
            $projectIds = $user->projet_ids;

            if (is_string($projectIds)) {
                $projectIds = json_decode($projectIds, true) ?? [];
            } elseif (!is_array($projectIds)) {
                $projectIds = [];
            }

            $user->projects_count = count($projectIds);

            // Profils
            $profilStrings = $user->profils->map(function ($profil) {
                return "{$profil->poste_profil} - {$profil->nom_profil}";
            });

            $user->profil_string = $profilStrings->implode(', ');

            // Add vehicule safely without modifying the relationship
            $user->vehicule_data = $user->vehicule ?? null;

            return $user;
        });

        // Hide sensitive fields
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

    public function getProjetSalaries(Projet $projet)
    {
        $salarieIds = $projet->salarie_ids ?? [];

        if (empty($salarieIds)) {
            return response()->json(['message' => 'No salaries found for this projet'], 404);
        }

        $salaries = Salarie::whereIn('id', $salarieIds)->get();

        return response()->json($salaries);
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
            'salaire_mensuel' => 'required|numeric',
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
                    'salarie' => $salarie->only(['id', 'nom', 'prenom', 'email', 'telephone', 'statut']),
                    'profil'  => $profil->only(['id', 'user_id', 'nom_profil', 'poste_profil']),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Error creating user', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Erreur lors de la création de l\'employé.');
        }
    }

    public function affecteGrantUser(Request $request, Salarie $salarie)
    {
        $request->validate([
            'projet_id' => 'required|integer|exists:projets,id',
            'enable' => 'required|boolean',
        ]);

        try {
            $projet = Projet::findOrFail($request->projet_id);

            $projetSalarieIds = $projet->salarie_ids ?? [];
            if (is_string($projetSalarieIds)) {
                $projetSalarieIds = json_decode($projetSalarieIds, true) ?? [];
            } elseif (!is_array($projetSalarieIds)) {
                $projetSalarieIds = [];
            }

            $salarieProjetIds = $salarie->projet_ids ?? [];
            if (is_string($salarieProjetIds)) {
                $salarieProjetIds = json_decode($salarieProjetIds, true) ?? [];
            } elseif (!is_array($salarieProjetIds)) {
                $salarieProjetIds = [];
            }

            if ($request->enable) {
                if (!in_array($salarie->id, $projetSalarieIds)) {
                    $projetSalarieIds[] = $salarie->id;
                }
                if (!in_array($projet->id, $salarieProjetIds)) {
                    $salarieProjetIds[] = $projet->id;
                }
            } else {
                $projetSalarieIds = array_values(array_filter($projetSalarieIds, fn($id) => $id !== $salarie->id));
                $salarieProjetIds = array_values(array_filter($salarieProjetIds, fn($id) => $id !== $projet->id));
            }

            $projet->salarie_ids = $projetSalarieIds;
            $projet->save();

            $salarie->projet_ids = $salarieProjetIds;
            $salarie->save();

            return back()->with('success', 'Affectation mise à jour avec succès.');
        } catch (\Exception $e) {
            Log::error('Error updating project assignment: ' . $e->getMessage());
            return back()->with('error', 'Erreur lors de la mise à jour de l\'affectation.');
        }
    }

    public function enableDisableUser(Salarie $salarie)
    {
        try {
            if ($salarie->statut === 'actif') {
                $salarie->statut = 'inactif';

                $projets = Projet::whereJsonContains('salarie_ids', $salarie->id)->get();

                foreach ($projets as $projet) {
                    $salarieIds = $projet->salarie_ids;
                    $filteredIds = array_filter($salarieIds, fn($id) => $id !== $salarie->id);
                    $projet->salarie_ids = array_values($filteredIds);
                    $projet->save();
                }

                $salarie->projet_ids = json_encode([]);
            } else {
                $salarie->statut = 'actif';
            }

            $salarie->save();

            return back()->with('success', 'Le statut du salarié a été mis à jour.');
        } catch (\Exception $e) {
            Log::error('Error updating user status: ' . $e->getMessage());
            return back()->with('error', 'Erreur lors de la mise à jour du statut.');
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

    
    public function fetchProjetsDirect()
    {
        $pythonScript = base_path('selenium_scripts/scraping_global_marches.py');

        // Exécuter le script Python
        $output = [];
        $returnVar = null;
        exec("python3 $pythonScript", $output, $returnVar);

        if ($returnVar === 0) {
            $csvSource = base_path('selenium_scripts/projets.csv');
            $jsonSource = base_path('selenium_scripts/projets.json');

            if (file_exists($csvSource) && file_exists($jsonSource)) {
                // Copier directement dans storage/app/public
                Storage::disk('public')->put('projets.csv', file_get_contents($csvSource));
                Storage::disk('public')->put('projets.json', file_get_contents($jsonSource));

                return redirect()->route('ressources-humaines.projets')
                    ->with('success', 'Projets mis à jour automatiquement !');
            } else {
                return redirect()->route('ressources-humaines.projets')
                    ->with('error', 'Fichiers CSV/JSON introuvables après exécution du script.');
            }
        }

        return redirect()->route('ressources-humaines.projets')
            ->with('error', 'Erreur lors de l\'exécution du script Selenium.');
    }

    public function SousTrais()
    {
        $projets = Projet::with('responsable')->get();

        return Inertia::render('ressources-humaines/SousTraitants', [
            'projets' => $projets,
        ]);
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

 }
