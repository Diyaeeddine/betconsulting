<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjetNv extends Model
{
    use HasFactory;

    protected $table = 'projet_nvs';

    protected $fillable = [
        'organisme',
        'objet',
        'ville_execution',
        'allotissement',
        'adresse_retrait',
        'contact',
        'montant_retrait',
        'mode_paiement',
        'mt_caution',
        'budget',
        'visite_lieux',
        'type',
        'observation',
        'soumission_electronique',
        'support',
        'secteur',
        'telechargement',
        'chemin_fichiers',
    ];

    protected $casts = [
        'chemin_fichiers' => 'array', // conversion automatique JSON <-> tableau
    ];
}
