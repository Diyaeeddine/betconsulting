<?php

use App\Models\Salarie;
use Illuminate\Support\Facades\Route;

Route::get('/debug-salaries', function () {
    $salaries = Salarie::with(['profil', 'projets', 'user'])->get();

    return response()->json([
        'salaries_count' => $salaries->count(),
        'salaries' => $salaries->map(function ($salarie) {
            return [
                'id' => $salarie->id,
                'nom' => $salarie->nom,
                'prenom' => $salarie->prenom,
                'profil_id' => $salarie->profil_id,
                'profil' => $salarie->profil ? [
                    'id' => $salarie->profil->id,
                    'poste_profil' => $salarie->profil->poste_profil,
                    'niveau_experience' => $salarie->profil->niveau_experience,
                ] : null,
                'projets_count' => $salarie->projets->count(),
                'user' => $salarie->user ? [
                    'id' => $salarie->user->id,
                    'name' => $salarie->user->name,
                    'email' => $salarie->user->email,
                ] : null,
            ];
        }),
    ]);
});
