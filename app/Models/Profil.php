<?php
// ============================================================
// FILE: app/Models/Profil.php
// ============================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profil extends Model
{
    use HasFactory;

    protected $fillable = [
        'salarie_id', // Fixed: should be salarie_id, not user_id
        'categorie_profil',
        'poste_profil',
        'missions',
        'niveau_experience',
        'competences_techniques',
        'certifications',
        'actif',
    ];

    protected $casts = [
        'competences_techniques' => 'array',
        'certifications' => 'array',
        'actif' => 'boolean',
    ];

    protected $attributes = [
        'actif' => true,
        'niveau_experience' => 'junior',
    ];

    public function salarie(): BelongsTo
    {
        return $this->belongsTo(Salarie::class, 'salarie_id', 'id');
    }
    
    // Scopes
    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }

    public function scopeParCategorie($query, $categorie)
    {
        return $query->where('categorie_profil', $categorie);
    }

    public function scopeParPoste($query, $poste)
    {
        return $query->where('poste_profil', $poste);
    }

    public function scopeParNiveauExperience($query, $niveau)
    {
        return $query->where('niveau_experience', $niveau);
    }
}