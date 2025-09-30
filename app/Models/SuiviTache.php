<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Salarie;

class SuiviTache extends Model
{
    protected $table = 'suivis_taches';

    protected $fillable = [
        'tache_dossier_id',
        'salarie_id',
        'type_action',
        'commentaire',
        'date_action',
        'temps_passe',
        'pourcentage_realise'
    ];

    protected $casts = [
        'date_action' => 'datetime',
        'temps_passe' => 'decimal:2',
        'pourcentage_realise' => 'decimal:2'
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
    public function scopeParAction($query, $type)
    {
        return $query->where('type_action', $type);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('date_action', 'desc');
    }
}