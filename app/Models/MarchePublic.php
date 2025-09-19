<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarchePublic extends Model
{
    use HasFactory;

    /**
     * Le nom de la table (optionnel si Laravel devine bien).
     */
    protected $table = 'marche_public';

    /**
     * Les attributs assignables en masse.
     */
    protected $fillable = [
        'type_ao',
        'n_reference',
        'etat',
        'is_accepted',
        'etape',
        'date_limite',
        'heure',
        'mo',
        'objet',
        'estimation',
        'caution',
        'attestation_reference',
        'cnss',
        'agrement',
        'equipe_demandee',
        'contrainte',
        'autres',
        'mode_attribution',
        'lieu_ao',
        'ville',
        'lots',
        'decision',
        'date_decision',
        'ordre_preparation',
    ];

    /**
     * Les attributs qui doivent être castés.
     */
    protected $casts = [
        'is_accepted'   => 'boolean',
        'date_limite'   => 'date',
        'date_decision' => 'date',
        'heure'         => 'datetime:H:i',
        'estimation'    => 'decimal:2',
        'caution'       => 'decimal:2',
    ];
}
