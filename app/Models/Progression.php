<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Progression extends Model
{
    use HasFactory;

    protected $fillable = [
        'projet_id',
        'description_progress',
        'progress',
        'statut',
        'date_validation',
        'pourcentage',
        'commentaire',
        'valide_par', 
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function validePar()
    {
        return $this->belongsTo(User::class, 'valide_par');
    }
}
