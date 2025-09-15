<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    
    protected $fillable = [
        'date_debut',
        'date_fin',
        'mssg',
        'description',
        'terrains_ids',
        'salarie_ids',
        'statut',
        'projet_id',
    ];

   
    protected $casts = [
        'terrains_ids' => 'array',
        'salarie_ids' => 'array',
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }
}