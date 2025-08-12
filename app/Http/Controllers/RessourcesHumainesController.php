<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Projet;
use App\Models\User;
use App\Models\Vehicule;
use App\Models\Salarie;

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

    public function projets()
    {
        $projets = Projet::with('responsable')->orderBy('created_at', 'desc')->get();
        $users = User::orderBy('name')->get();

        return Inertia::render('ressources-humaines/Projets', [
            'projets' => $projets,
            'users' => $users,
        ]);
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
}