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
use App\Models\ProjetNv;
use App\Models\AppelOffer;
use App\Models\BonCommande;
use App\Models\ResultatBonCommande;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\hash;
use Inertia\Inertia;
use ZipArchive;
use League\Csv\Reader;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;


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


    public function getProjetsData()
    {
        $projets = ProjetNv::all(); // récupère tous les projets
        return response()->json($projets);
    }

    public function fetchProjetsDirect()
    {
        $pythonScript = base_path('selenium_scripts/scraping_global_marches.py');

        // Vérifier si un autre Selenium est déjà en cours
        $lock = Cache::lock('selenium_lock', 300); // verrou de 5 minutes
        if (!$lock->get()) {
            return redirect()->route('ressources-humaines.projets')
                ->with('error', 'Une exécution Selenium est déjà en cours, réessayez dans quelques minutes.');
        }

        try {
            // Exécuter le script Python EN ARRIÈRE-PLAN pour ne pas bloquer l'UI
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                // Windows
                pclose(popen("start /B python $pythonScript", "r"));
            } else {
                // Linux / macOS
                exec("nohup python3 $pythonScript > /dev/null 2>&1 &");
            }

            // Chemins des fichiers générés
            $csvPath = storage_path('app/public/projets.csv');
            $jsonPath = storage_path('app/public/projets.json');

            if (!file_exists($csvPath) || !file_exists($jsonPath)) {
                return redirect()->route('ressources-humaines.projets')
                    ->with('error', 'Fichiers CSV/JSON introuvables après exécution du script.');
            }

            try {
                // Lire le JSON pour récupérer les chemins des fichiers extraits
                $jsonData = json_decode(file_get_contents($jsonPath), true);
                if (!$jsonData) {
                    throw new \Exception('Impossible de lire le fichier JSON.');
                }

                // Créer un index basé sur "Objet" pour associer CSV <-> JSON
                $jsonIndex = [];
                foreach ($jsonData as $proj) {
                    $objetKey = trim($proj['Objet'] ?? $proj['Objet '] ?? '');
                    if ($objetKey) {
                        $jsonIndex[$objetKey] = $proj;
                    }
                }

                // Lire le CSV pour l'insertion
                $csv = Reader::createFromPath($csvPath, 'r');
                $csv->setHeaderOffset(0);
                $records = $csv->getRecords();

                foreach ($records as $row) {
                    $objet = trim($row['Objet '] ?? '');
                    $projJson = $jsonIndex[$objet] ?? [];

                    ProjetNv::updateOrCreate(
                        [
                            'objet' => $objet,
                            'organisme' => $row['Organisme '] ?? null,
                            'ville_execution' => $row["Ville d'exécution "] ?? null,
                        ],
                        [
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
                            'chemin_fichiers' => $projJson['EXTRACTED_FILES'] ?? [], // chemins extraits depuis le JSON
                        ]
                    );
                }
            } catch (\Exception $e) {
                return redirect()->route('ressources-humaines.projets')
                    ->with('error', 'Erreur lors de l\'importation : ' . $e->getMessage());
            }
        } finally {
            // Libérer le lock
            $lock->release();
        }

        return redirect()->route('ressources-humaines.projets')
            ->with('success', 'Le script Selenium a été lancé en arrière-plan. Les projets seront mis à jour automatiquement.');
    }

    public function getAppelOffersData()
    {
        $appelOffers = AppelOffer::orderBy('date_ouverture', 'desc')->get();
        return response()->json($appelOffers);
    }


    public function fetchResultatsOffres()
    {
        $pythonScript = base_path('selenium_scripts/resultats_offres.py');

        // Lock pour éviter les exécutions multiples
        $lock = Cache::lock('selenium_appel_offer_lock', 300);
        if (!$lock->get()) {
            return redirect()->route('ressources-humaines.appel-offer')
                ->with('error', 'Une exécution Selenium est déjà en cours, réessayez dans quelques minutes.');
        }

        try {
            // Lancer le script Python en arrière-plan
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                pclose(popen("start /B python $pythonScript", "r"));
            } else {
                exec("nohup python3 $pythonScript > /dev/null 2>&1 &");
            }

            $csvPath = storage_path('app/public/resultats_offres/resultats_offres.csv');
            $jsonPath = storage_path('app/public/resultats_offres/resultats_offres.json');

            if (!file_exists($csvPath) || !file_exists($jsonPath)) {
                return redirect()->route('ressources-humaines.appel-offer')
                    ->with('error', 'Fichiers CSV/JSON introuvables après exécution du script.');
            }

            // Lire le JSON pour récupérer les chemins des fichiers
            $jsonData = json_decode(file_get_contents($jsonPath), true) ?? [];
            $jsonIndex = [];
            foreach ($jsonData as $offer) {
                $objetKey = trim($offer['Objet'] ?? '');
                if ($objetKey) {
                    $jsonIndex[$objetKey] = $offer;
                }
            }

            // Lire le CSV
            $csv = Reader::createFromPath($csvPath, 'r');
            $csv->setHeaderOffset(0);
            $records = $csv->getRecords();

            foreach ($records as $row) {

                // Récupérer toutes les colonnes avec fallback null
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
                $lien_pv = $row['Lien_PV'] ?? null;
                $dao = $row['D.A.O'] ?? null;
                $pv = $row['PV'] ?? null;

                $offerJson = $jsonIndex[$objet] ?? [];
                $chemin_fichiers = $offerJson['EXTRACTED_FILES'] ?? [];

                // Convertir les dates si elles existent
                $date_ouverture = $date_ouverture ? Carbon::createFromFormat('d/m/Y', $date_ouverture) : null;
                $date_adjudications = $date_adjudications ? Carbon::createFromFormat('d/m/Y', $date_adjudications) : null;
                $date_affichage = $date_affichage ? Carbon::createFromFormat('d/m/Y', $date_affichage) : null;

                // Créer ou mettre à jour l'offre
                AppelOffer::updateOrCreate(
                    [
                        'reference' => $reference,
                        'objet' => $objet,
                        'maitre_ouvrage' => $maitre_ouvrage,
                    ],
                    [
                        'pv' => $pv,
                        'date_ouverture' => $date_ouverture,
                        'budget' => $budget,
                        'lien_dao' => $lien_dao,
                        'lien_pv' => $lien_pv,
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
            return redirect()->route('ressources-humaines.appel-offer')
                ->with('error', 'Erreur lors de l\'importation : ' . $e->getMessage());
        } finally {
            $lock->release();
        }

        return redirect()->route('ressources-humaines.appel-offer')
            ->with('success', 'Le script Selenium a été lancé en arrière-plan. Les appels d’offres seront mis à jour automatiquement.');
    }




    public function appelOfferPage()
    {
        return inertia('ressources-humaines/appel_offer');
    }

    public function SousTrais()
    {
        $projets = Projet::with('responsable')->get();

        return Inertia::render('ressources-humaines/SousTraitants', [
            'projets' => $projets,
        ]);
    }


    public function fetchBonsCommande()
    {
        $pythonScript = base_path('selenium_scripts/bons_commande.py');

        $lock = Cache::lock('selenium_lock', 300); // verrou 5 min
        if (!$lock->get()) {
            return redirect()->route('ressources-humaines.bons-commandes')
                ->with('error', 'Une exécution Selenium est déjà en cours, réessayez dans quelques minutes.');
        }

        try {
            // Exécuter le script Python en arrière-plan
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                pclose(popen("start /B python $pythonScript", "r"));
            } else {
                exec("nohup python3 $pythonScript > /dev/null 2>&1 &");
            }

            // Attendre un peu que les fichiers soient générés
            sleep(10);

            $csvPath = storage_path('app/public/bons_commande/bons_commande.csv');
            $jsonPath = storage_path('app/public/bons_commande/bons_commande.json');

            if (!file_exists($csvPath) || !file_exists($jsonPath)) {
                return redirect()->route('ressources-humaines.bons-commandes')
                    ->with('error', 'Fichiers CSV/JSON introuvables après exécution du script.');
            }

            // Fonction pour parser les dates
            function parseDate($dateString)
            {
                if (empty($dateString)) {
                    return null;
                }

                $parts = explode('|', $dateString);
                $firstPart = trim($parts[0]);

                try {
                    return Carbon::createFromFormat('d/m/Y H:i', $firstPart);
                } catch (\Exception $e) {
                    Log::warning("Impossible de parser la date: $dateString", ['error' => $e->getMessage()]);
                    return null;
                }
            }

            $csv = \League\Csv\Reader::createFromPath($csvPath, 'r');
            $csv->setHeaderOffset(0);
            $records = $csv->getRecords();

            $insertedCount = 0;
            $duplicateCount = 0;
            $errorCount = 0;

            foreach ($records as $index => $row) {
                try {
                    $cleanRow = array_map('trim', $row);
                    $dateLimit = parseDate($cleanRow['Date/Heure limite'] ?? '');

                    $bonData = [
                        'n_ordre' => $cleanRow['N d\'ordre'] ?? null,
                        'reference' => $cleanRow['Référence'] ?? '',
                        'date_heure_limite' => $dateLimit,
                        'objet' => $cleanRow['Objet '] ?? '',
                        'organisme' => $cleanRow['Organisme '] ?? '',
                        'ville_execution' => $cleanRow['Ville d\'exécution '] ?? '',
                        'type' => $cleanRow['Type '] ?? '',
                        'observation' => $cleanRow['Obsérvation '] ?? '',
                        'visite_lieux' => $cleanRow['Visite des lieux '] ?? '',
                        'telechargement_dao' => $cleanRow['Téléchargement_DAO'] ?? '',
                        'lien_cliquer_ici' => $cleanRow['Lien_Cliquer_Ici'] ?? '',
                        'soumission_electronique' => $cleanRow['Soumission électronique '] ?? '',
                        'chemin_fichiers' => null,
                    ];

                    foreach ($bonData as $key => $value) {
                        if (is_string($value)) {
                            $bonData[$key] = trim($value);
                            if ($bonData[$key] === '' || $bonData[$key] === '---') {
                                $bonData[$key] = null;
                            }
                        }
                    }

                    Log::info("Vérification doublon ligne $index:", $bonData);

                    // Vérifier doublon et insérer
                    $bonCommande = BonCommande::firstOrCreate(
                        [
                            'n_ordre' => $bonData['n_ordre'],
                            'reference' => $bonData['reference']
                        ],
                        $bonData
                    );

                    if ($bonCommande->wasRecentlyCreated) {
                        $insertedCount++;
                        Log::info("Bon de commande inséré (ID: {$bonCommande->id})");
                    } else {
                        $duplicateCount++;
                        Log::info("Doublon ignoré : N° {$bonData['n_ordre']} - Réf {$bonData['reference']}");
                    }
                } catch (\Exception $e) {
                    $errorCount++;
                    Log::error("Erreur insertion ligne $index", [
                        'error' => $e->getMessage(),
                        'line' => $e->getLine(),
                        'file' => $e->getFile(),
                        'data' => $cleanRow ?? []
                    ]);
                }
            }

            $message = "Import terminé : $insertedCount ajoutés, $duplicateCount doublons ignorés.";
            if ($errorCount > 0) {
                $message .= " $errorCount erreurs détectées (voir logs).";
            }

            return redirect()->route('ressources-humaines.bons-commandes')
                ->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'importation des bons de commande:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('ressources-humaines.bons-commandes')
                ->with('error', 'Erreur lors de l\'importation : ' . $e->getMessage());
        } finally {
            $lock->release();
        }
    }



    // Récupérer les données JSON des bons de commande
    public function getBonsCommandeData()
    {
        $bons = BonCommande::orderBy('created_at', 'desc')->get();
        return Inertia::render('ressources-humaines/BonCommande', [
            'bonsCommande' => $bons
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

    public function listDaoFiles(Request $request)
    {
        $zipPath = $request->input('zipPath'); // chemin du zip depuis le JSON

        if (!$zipPath || !Storage::exists($zipPath)) {
            return response()->json(['error' => 'Fichier ZIP introuvable'], 404);
        }

        $zip = new ZipArchive();
        $filesList = [];

        $fullPath = Storage::path($zipPath);
        if ($zip->open($fullPath) === true) {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $stat = $zip->statIndex($i);
                if (!str_ends_with($stat['name'], '/')) { // ignorer les dossiers
                    $filesList[] = [
                        'name' => basename($stat['name']),
                        'path' => $stat['name']
                    ];
                }
            }
            $zip->close();
        }

        return response()->json($filesList);
    }

    // Optionnel : pour télécharger directement un fichier
    public function downloadDaoFile(Request $request)
    {
        $zipPath = $request->input('zipPath');
        $filePath = $request->input('filePath');

        if (!$zipPath || !$filePath || !Storage::exists($zipPath)) {
            return response()->json(['error' => 'Fichier introuvable'], 404);
        }

        $zip = new ZipArchive();
        $fullPath = Storage::path($zipPath);

        if ($zip->open($fullPath) === true) {
            $tmpFile = tempnam(sys_get_temp_dir(), 'dao_');
            copy("zip://{$fullPath}#{$filePath}", $tmpFile);
            $zip->close();

            return response()->download($tmpFile, basename($filePath))->deleteFileAfterSend(true);
        }

        return response()->json(['error' => 'Impossible d’ouvrir le fichier ZIP'], 500);
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
}
