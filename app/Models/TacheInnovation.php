<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TacheInnovation extends Model
{
    use HasFactory;

    protected $fillable = [
        'innovation_id', 'titre', 'description', 'statut', 'priorite',
        'assignee_id', 'createur_id', 'date_debut', 'date_fin_prevue',
        'date_fin_reelle', 'estimation_heures', 'heures_passees',
        'notes_techniques', 'checklist'
    ];

    protected $casts = [
        'checklist' => 'array',
        'date_debut' => 'date',
        'date_fin_prevue' => 'date',
        'date_fin_reelle' => 'date',
    ];

    public function innovation()
    {
        return $this->belongsTo(Innovation::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function createur()
    {
        return $this->belongsTo(User::class, 'createur_id');
    }
}
