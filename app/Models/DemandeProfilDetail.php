<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemandeProfilDetail extends Model
{
    use HasFactory;

    protected $table = 'demandes_profils_details';

    protected $fillable = [
        'demande_id',
        'categorie_profil',
        'poste_profil',
        'quantite',
        'niveau_experience',
        'competences_requises',
        'disponible',
        'profils_disponibles',
    ];

    protected $casts = [
        'competences_requises' => 'array',
        'disponible' => 'boolean',
        'quantite' => 'integer',
        'profils_disponibles' => 'integer',
    ];

    protected $attributes = [
        'quantite' => 1,
        'disponible' => false,
        'profils_disponibles' => 0,
    ];

    // Relations
    public function demande(): BelongsTo
    {
        return $this->belongsTo(DemandeProfil::class, 'demande_id');
    }

    // Accessors
    public function getDisponibiliteStatusAttribute(): string
    {
        if ($this->disponible) {
            return 'available';
        }
        return $this->profils_disponibles > 0 ? 'partial' : 'unavailable';
    }

    public function getDisponibilitePercentageAttribute(): int
    {
        if ($this->quantite <= 0) {
            return 0;
        }
        return min(100, round(($this->profils_disponibles / $this->quantite) * 100));
    }
}