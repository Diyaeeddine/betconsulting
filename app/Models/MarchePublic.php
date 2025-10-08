<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarchePublic extends Model
{
    use HasFactory;

    /**
     * Nom de la table (optionnel car Laravel peut le deviner).
     */
    protected $table = 'marche_public';

    /**
     * Colonnes remplissables en masse.
     */
    protected $fillable = [
        'reference',
        'maitre_ouvrage',
        'pv',
        'caution_provisoire',
        'date_ouverture',
        'date_limite_soumission',
        'date_publication',
        'statut',
        'type_marche',
        'budget',
        'urgence',
        'zone_geographique',
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
        'importance',
        'etat',
        'is_accepted',
        'etape',
    ];

    /**
     * Casts automatiques pour certains attributs.
     */
    protected $casts = [
        'caution_provisoire'     => 'decimal:2',
        'date_ouverture'         => 'date',
        'date_limite_soumission' => 'datetime',
        'date_publication'       => 'datetime',
        'date_adjudications'     => 'date',
        'date_affichage'         => 'date',
        'chemin_fichiers'        => 'array',
        'is_accepted'            => 'boolean',
    ];
}
