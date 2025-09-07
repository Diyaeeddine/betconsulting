<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salarie extends Model 
{
    use HasFactory;

    protected $fillable = [
        'nom', 
        'prenom', 
        'poste', 
        'email', 
        'telephone',
        'salaire_mensuel', 
        'date_embauche', 
        'statut', 
        'password',
        'emplacement',
    ];

    protected $casts = [
        'password' => 'hashed',
        'projet_ids' => 'array',
        'terrain_ids'=> 'array',
    ];
    protected $attributes = [
        'projet_ids' => '[]',
        'terrain_ids' => '[]',
    ];
    protected $hidden = [
        'password',
    ];

    public function vehicule() {
        return $this->hasOne(Vehicule::class);
    }

    public function materiels() {
        return $this->hasMany(Materiel::class);
    }

    public function profils() {
        return $this->hasMany(Profil::class, 'user_id');
    }

    public function projets() {
        return $this->belongsToMany(Projet::class, 'projet_salarie');
    }

    public function formations()
{
    return $this->belongsToMany(Formation::class, 'formation_salarie')
        ->withPivot(['statut', 'progression', 'note'])
        ->withTimestamps();
}

}