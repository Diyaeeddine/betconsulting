<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppelOffer extends Model
{
    use HasFactory;

    protected $table = 'appel_offers';

    protected $fillable = [
        'reference',
        'maitre_ouvrage',
        'pv',
        'date_ouverture',
        'budget',
        'lien_dao',
        'lien_pv',
        'dao',
        'date_adjudications',
        'ville',
        'montant',
        'objet',
        'adjudicataire',
        'date_affichage',
        'chemin_fichiers',
        
    ];

    protected $casts = [
        'chemin_fichiers' => 'array',
        'date_ouverture' => 'date',
        'date_adjudications' => 'date',
        'date_affichage' => 'date',
    ];

}
