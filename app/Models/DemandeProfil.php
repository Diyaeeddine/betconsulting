<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DemandeProfil extends Model
{
    use HasFactory;

    protected $table = 'demandes_profils';

    protected $fillable = [
        'demandeur_id',
        'titre_demande',
        'description',
        'urgence',
        'date_souhaitee',
        'statut',
        'traite_par',
        'commentaire_rh',
        'traite_le',
    ];

    protected $casts = [
        'date_souhaitee' => 'date',
        'traite_le' => 'datetime',
    ];

    // Relations
    public function demandeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'demandeur_id');
    }

    public function traitePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'traite_par');
    }

    public function details(): HasMany
    {
        return $this->hasMany(DemandeProfilDetail::class, 'demande_id');
    }

    // Scopes
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeUrgent($query)
    {
        return $query->whereIn('urgence', ['urgent', 'critique']);
    }

    public function scopeParDemandeur($query, $userId)
    {
        return $query->where('demandeur_id', $userId);
    }
}