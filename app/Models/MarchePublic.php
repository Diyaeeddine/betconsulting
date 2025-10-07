<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\DossierMarche;
use App\Models\DocumentDossier;
use App\Models\ParticipationMarche;
use App\Models\HistoriqueMarche;
class MarchePublic extends Model
{
    use HasFactory;

    protected $table = 'marche_public';

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

    /**
     * Relation avec les dossiers du marché
     */
    public function dossiers()
    {
        return $this->hasMany(DossierMarche::class, 'marche_id');
    }

    public function fichiers()
{
    return $this->hasManyThrough(
        DocumentDossier::class,
        DossierMarche::class,
        'marche_id',
        'dossier_marche_id'
    );
}

public function participants()
{
    return $this->hasMany(ParticipationMarche::class, 'marche_id');
}

public function historiques()
{
    return $this->hasMany(HistoriqueMarche::class, 'marche_id');
}


public function participations()
{
    return $this->hasMany(ParticipationMarche::class, 'marche_public_id');
}



}