<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Entretien extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'entretiens';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'salarie_id',
        'poste_vise',
        'date_entretien',
        'type_entretien',
        'evaluateur_principal',
        'expert_technique',
        'responsable_rh',
        'scores_techniques',
        'scores_comportementaux',
        'scores_adequation',
        'score_technique',
        'score_comportemental',
        'score_adequation',
        'score_total',
        'points_forts',
        'points_vigilance',
        'recommandation',
        'statut',
        'commentaire_validation',
        'valide_par',
        'valide_le',
        'motif_rejet',
        'rejete_par',
        'rejete_le',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_entretien' => 'date',
        'valide_le' => 'datetime',
        'rejete_le' => 'datetime',
        'scores_techniques' => 'array',
        'scores_comportementaux' => 'array',
        'scores_adequation' => 'array',
        'score_technique' => 'decimal:2',
        'score_comportemental' => 'decimal:2',
        'score_adequation' => 'decimal:2',
        'score_total' => 'decimal:2',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'scores_techniques' => '{}',
        'scores_comportementaux' => '{}',
        'scores_adequation' => '{}',
        'score_technique' => 0,
        'score_comportemental' => 0,
        'score_adequation' => 0,
        'score_total' => 0,
        'statut' => 'en_cours',
    ];

    /**
     * Relation avec le salarié évalué
     *
     * @return BelongsTo
     */
    public function salarie(): BelongsTo
    {
        return $this->belongsTo(Salarie::class);
    }

    /**
     * Scope pour filtrer les entretiens par statut
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $statut
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeParStatut($query, string $statut)
    {
        return $query->where('statut', $statut);
    }

    /**
     * Scope pour filtrer les entretiens par type
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeParType($query, string $type)
    {
        return $query->where('type_entretien', $type);
    }

    /**
     * Scope pour obtenir les entretiens récents
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $jours
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecents($query, int $jours = 30)
    {
        return $query->where('date_entretien', '>=', now()->subDays($jours));
    }

    /**
     * Scope pour obtenir les entretiens complétés
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeComplete($query)
    {
        return $query->where('statut', 'complete');
    }

    /**
     * Scope pour les entretiens en attente de validation
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeEnAttenteValidation($query)
    {
        return $query->where('statut', 'en_attente_validation');
    }

    /**
     * Accessor pour obtenir le nom complet du salarié
     *
     * @return string
     */
    public function getNomCompletSalarieAttribute(): string
    {
        return $this->salarie ? $this->salarie->nom_complet : 'N/A';
    }

    /**
     * Accessor pour obtenir le pourcentage du score total
     *
     * @return float
     */
    public function getPourcentageScoreAttribute(): float
    {
        return round(($this->score_total / 40) * 100, 2);
    }

    /**
     * Accessor pour obtenir l'appréciation selon le score
     *
     * @return string
     */
    public function getAppreciationAttribute(): string
    {
        $pourcentage = $this->pourcentage_score;

        if ($pourcentage >= 90) {
            return 'Excellent';
        } elseif ($pourcentage >= 80) {
            return 'Très bien';
        } elseif ($pourcentage >= 70) {
            return 'Bien';
        } elseif ($pourcentage >= 60) {
            return 'Satisfaisant';
        } elseif ($pourcentage >= 50) {
            return 'Moyen';
        } else {
            return 'Insuffisant';
        }
    }

    /**
     * Accessor pour obtenir la couleur selon le score
     *
     * @return string
     */
    public function getCouleurScoreAttribute(): string
    {
        $pourcentage = $this->pourcentage_score;

        if ($pourcentage >= 80) {
            return 'green';
        } elseif ($pourcentage >= 60) {
            return 'blue';
        } elseif ($pourcentage >= 50) {
            return 'yellow';
        } else {
            return 'red';
        }
    }

    /**
     * Accessor pour le libellé du type d'entretien
     *
     * @return string
     */
    public function getTypeEntretienLibelleAttribute(): string
    {
        return match($this->type_entretien) {
            'premier' => 'Premier entretien',
            'technique' => 'Entretien technique',
            'final' => 'Entretien final',
            default => ucfirst($this->type_entretien),
        };
    }

    /**
     * Accessor pour le libellé du statut
     *
     * @return string
     */
    public function getStatutLibelleAttribute(): string
    {
        return match($this->statut) {
            'en_cours' => 'En cours',
            'complete' => 'Complété',
            'en_attente_validation' => 'En attente de validation',
            'validee' => 'Validé',
            'rejete' => 'Rejeté',
            default => ucfirst($this->statut),
        };
    }

    /**
     * Accessor pour le libellé de la recommandation
     *
     * @return string
     */
    public function getRecommandationLibelleAttribute(): string
    {
        return match($this->recommandation) {
            'fortement_recommande' => 'Fortement recommandé',
            'recommande' => 'Recommandé',
            'reserve' => 'Avec réserve',
            'non_recommande' => 'Non recommandé',
            default => ucfirst($this->recommandation ?? 'Non défini'),
        };
    }

    /**
     * Check if entretien is validated
     *
     * @return bool
     */
    public function isValidated(): bool
    {
        return $this->statut === 'validee';
    }

    /**
     * Check if entretien is rejected
     *
     * @return bool
     */
    public function isRejected(): bool
    {
        return $this->statut === 'rejete';
    }

    /**
     * Check if entretien is pending validation
     *
     * @return bool
     */
    public function isPendingValidation(): bool
    {
        return $this->statut === 'en_attente_validation';
    }

    /**
     * Boot method pour gérer les événements du modèle
     */
    protected static function boot()
    {
        parent::boot();

        // Avant de sauvegarder, calculer le score total si les scores individuels sont définis
        static::saving(function ($entretien) {
            if ($entretien->score_technique !== null && 
                $entretien->score_comportemental !== null && 
                $entretien->score_adequation !== null) {
                $entretien->score_total = 
                    $entretien->score_technique + 
                    $entretien->score_comportemental + 
                    $entretien->score_adequation;
            }
        });
    }
}