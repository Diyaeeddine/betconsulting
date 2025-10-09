<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\DossierMarche;
use App\Models\AffectationTache;
use App\Models\SuiviTache;
use App\Models\DocumentDossier;

class TacheDossier extends Model
{
    protected $table = 'taches_dossier';

    protected $fillable = [
        'dossier_marche_id',
        'nom_tache',
        'description',
        'priorite',
        'statut',
        'ordre',
        'duree_estimee',
        'duree_reelle',
        'date_limite',
        'date_debut',
        'date_fin',
        'instructions',
        'fichiers_requis',
        'fichiers_produits',
        'commentaires'
    ];

    protected $casts = [
        'date_limite' => 'date',
        'date_debut' => 'date',
        'date_fin' => 'date',
        'duree_estimee' => 'decimal:2',
        'duree_reelle' => 'decimal:2',
        'fichiers_requis' => 'array',
        'fichiers_produits' => 'array'
    ];

    // Relations
    public function dossier(): BelongsTo
    {
        return $this->belongsTo(DossierMarche::class, 'dossier_marche_id');
    }

    public function affectations(): HasMany
    {
        return $this->hasMany(AffectationTache::class, 'tache_dossier_id');
    }

    public function suivis(): HasMany
    {
        return $this->hasMany(SuiviTache::class, 'tache_dossier_id');
    }

    // Scopes
    public function scopeParPriorite($query, $priorite)
    {
        return $query->where('priorite', $priorite);
    }

    public function scopeParStatut($query, $statut)
    {
        return $query->where('statut', $statut);
    }

    public function scopeEnRetard($query)
    {
        return $query->where('date_limite', '<', now())
                    ->whereNotIn('statut', ['terminee', 'validee']);
    }

    // Accessors
    public function getEstEnRetardAttribute()
    {
        return $this->date_limite && 
               $this->date_limite->isPast() && 
               !in_array($this->statut, ['terminee', 'validee']);
    }

    public function getEstAssigneeAttribute()
    {
        return $this->affectations()->where('statut_affectation', 'active')->exists();
    }

    // Methods
    public function affecter($salarieId, $role = 'collaborateur', $dateLimite = null, $notes = null)
    {
        return AffectationTache::create([
            'tache_dossier_id' => $this->id,
            'salarie_id' => $salarieId,
            'role_affectation' => $role,
            'date_affectation' => now(),
            'date_limite_assignee' => $dateLimite,
            'notes_affectation' => $notes
        ]);
    }

    public function marquerTerminee($salarieId, $commentaire = null)
    {
        $this->update([
            'statut' => 'terminee',
            'date_fin' => now()
        ]);

        $this->suivis()->create([
            'salarie_id' => $salarieId,
            'type_action' => 'finalisation',
            'commentaire' => $commentaire,
            'date_action' => now()
        ]);

        // Recalculer l'avancement du dossier
        $this->dossier->calculerAvancement();
    }

    public function fichiers()
{
    return $this->hasMany(DocumentDossier::class, 'tache_dossier_id');
}

public function documents()
{
    return $this->hasMany(DocumentDossier::class, 'tache_dossier_id');
}

}