<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'type', // en_ligne | presentiel
        'date_debut',
        'date_fin',
        'duree',
        'statut', // planifiée | en cours | terminée
        'responsable_id',
        'competences',
        'lien_meet',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
    ];

    public function participants()
    {
        return $this->belongsToMany(Salarie::class, 'formation_salarie')
            ->withPivot(['statut', 'progression', 'note'])
            ->withTimestamps();
    }

    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }
}
