<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketSupport extends Model
{
    use HasFactory;

    protected $fillable = [
        'innovation_id', 'titre', 'description', 'type', 'statut', 'priorite',
        'severite', 'demandeur_id', 'assignee_id', 'solution', 'etapes_reproduction',
        'environnement', 'date_resolution', 'temps_resolution_heures'
    ];

    protected $casts = [
        'etapes_reproduction' => 'array',
        'date_resolution' => 'datetime',
    ];

    public function innovation()
    {
        return $this->belongsTo(Innovation::class);
    }

    public function demandeur()
    {
        return $this->belongsTo(User::class, 'demandeur_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }
}
