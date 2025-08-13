<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommentaireInnovation extends Model
{
    use HasFactory;

    protected $fillable = [
        'innovation_id',
        'auteur_id',
        'contenu',
        'type',
        'parent_id',
        'est_prive',
        'est_important',
        'mentions',
        'fichiers_attaches',
        'lu_par'
    ];

    protected $casts = [
        'est_prive' => 'boolean',
        'est_important' => 'boolean',
        'mentions' => 'array',
        'fichiers_attaches' => 'array',
        'lu_par' => 'array'
    ];

    // Relations
    public function innovation(): BelongsTo
    {
        return $this->belongsTo(Innovation::class);
    }

    public function auteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(CommentaireInnovation::class, 'parent_id');
    }

    public function reponses(): HasMany
    {
        return $this->hasMany(CommentaireInnovation::class, 'parent_id');
    }

    // Scopes
    public function scopePublics($query)
    {
        return $query->where('est_prive', false);
    }

    public function scopeImportants($query)
    {
        return $query->where('est_important', true);
    }

    public function scopeParents($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Accessors
    public function getEstLuParAttribute($userId)
    {
        return in_array($userId, $this->lu_par ?? []);
    }

    public function getNombreFichiersAttribute()
    {
        return count($this->fichiers_attaches ?? []);
    }

    public function getNombreReponsesAttribute()
    {
        return $this->reponses()->count();
    }

    // Methods
    public function marquerCommeLu($userId)
    {
        $luPar = $this->lu_par ?? [];
        if (!in_array($userId, $luPar)) {
            $luPar[] = $userId;
            $this->lu_par = $luPar;
            $this->save();
        }
    }

    public function ajouterMention($userId)
    {
        $mentions = $this->mentions ?? [];
        if (!in_array($userId, $mentions)) {
            $mentions[] = $userId;
            $this->mentions = $mentions;
            $this->save();
        }
    }
}
