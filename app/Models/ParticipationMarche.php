<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParticipationMarche extends Model
{
    protected $table = 'participations_marche';
    
    protected $fillable = [
        'marche_id',
        'salarie_id',
        'role_global',
        'nb_taches_affectees',
        'nb_taches_terminees',
        'temps_total_passe',
        'date_debut_participation',
        'date_fin_participation',
        'participation_active'
    ];

    protected $casts = [
        'date_debut_participation' => 'datetime',
        'date_fin_participation' => 'datetime',
        'participation_active' => 'boolean',
        'nb_taches_affectees' => 'integer',
        'nb_taches_terminees' => 'integer',
        'temps_total_passe' => 'decimal:2'
    ];

    public function marche(): BelongsTo
    {
        return $this->belongsTo(MarchePublic::class, 'marche_id');
    }

    public function salarie(): BelongsTo
    {
        return $this->belongsTo(Salarie::class, 'salarie_id');
    }

    public function getTauxCompletionAttribute()
    {
        if ($this->nb_taches_affectees === 0) return 0;
        return round(($this->nb_taches_terminees / $this->nb_taches_affectees) * 100, 2);
    }
}