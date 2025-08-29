<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BonCommande extends Model
{
    use HasFactory;

    protected $table = 'bons_commandes';

    protected $fillable = [
        'observation',
        'objet',
        'visite_lieux',
        'ville_execution',
        'organisme',
        'telechargement_dao',
        'lien_cliquer_ici',
        'type',
        'soumission_electronique',
        'chemin_fichiers', // Ajouté
    ];

    protected $casts = [
        'chemin_fichiers' => 'array', // Pour récupérer un tableau JSON
    ];
}
