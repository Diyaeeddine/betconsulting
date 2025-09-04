<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResultatBonCommande extends Model
{
    use HasFactory;

    protected $table = 'resultats_bon_commande';

    protected $fillable = [
        'reference',
        'maitre_ouvrage',
        'objet',
        'adjudicataire',
        'ville',
        'budget',
        'montant',
        'date_adjudications',
        'date_ouverture',
        'date_affichage',
        'dao',
        'lien_dao',
        'chemin_fichiers'
    ];

    protected $casts = [
        'chemin_fichiers' => 'array',
        'date_adjudications' => 'date',
        'date_ouverture' => 'date',
        'date_affichage' => 'date',
    ];
}