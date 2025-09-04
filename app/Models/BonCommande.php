<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BonCommande extends Model
{
    use HasFactory;

    protected $table = 'bons_commandes';

    protected $fillable = [
        'n_ordre',                 // N d'ordre
        'reference',               // Référence
        'date_heure_limite',       // Date/Heure limite
        'observation',             // Obsérvation
        'objet',                   // Objet
        'visite_lieux',            // Visite des lieux
        'ville_execution',         // Ville d'exécution
        'organisme',               // Organisme
        'telechargement_dao',      // Lien Télécharger D.A.O
        'lien_cliquer_ici',        // Lien "Cliquer ici"
        'type',                    // Type
        'soumission_electronique', // Soumission électronique
        'chemin_fichiers',         // Pour stocker les fichiers si besoin
    ];

    protected $casts = [
        'chemin_fichiers' => 'array', // Pour récupérer un tableau JSON
    ];
}