<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Salarie;

class AffectationTache extends Model
{
    protected $table = 'affectations_taches';

    protected $fillable = [
        'tache_dossier_id',
        'salarie_id',
        'role_affectation',
        'date_affectation',
        'date_limite_assignee',
        'statut_affectation',
        'notes_affectation'
    ];

    protected $casts = [
        'date_affectation' => 'datetime',
        'date_limite_assignee' => 'datetime'
    ];

    // Relations
    public function tache(): BelongsTo
    {
        return $this->belongsTo(TacheDossier::class, 'tache_dossier_id');
    }

    public function salarie(): BelongsTo
    {
        return $this->belongsTo(Salarie::class, 'salarie_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('statut_affectation', 'active');
    }

    public function scopeParRole($query, $role)
    {
        return $query->where('role_affectation', $role);
    }
}