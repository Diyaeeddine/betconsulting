<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Innovation extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre', 'description', 'statut', 'priorite', 'date_debut',
        'date_fin_prevue', 'date_fin_reelle', 'budget_alloue', 'budget_utilise',
        'responsable_id', 'createur_id', 'tags', 'objectifs', 'risques', 'progression'
    ];

    protected $casts = [
        'tags' => 'array',
        'date_debut' => 'date',
        'date_fin_prevue' => 'date',
        'date_fin_reelle' => 'date',
        'budget_alloue' => 'decimal:2',
        'budget_utilise' => 'decimal:2',
    ];

    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    public function createur()
    {
        return $this->belongsTo(User::class, 'createur_id');
    }

    public function taches()
    {
        return $this->hasMany(TacheInnovation::class);
    }

    public function tickets()
    {
        return $this->hasMany(TicketSupport::class);
    }

    public function scopeActifs($query)
    {
        return $query->where('statut', 'en_cours');
    }
}
