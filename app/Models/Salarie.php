<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salarie extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom', 'prenom', 'poste', 'email', 'telephone',
        'salaire_mensuel', 'date_embauche', 'statut', 'projet_id',
        'user_id' // Add this to link with User model
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function vehicule()
    {
        return $this->hasOne(Vehicule::class);
    }

    public function materiels()
    {
        return $this->hasMany(Materiel::class);
    }

    // Add relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}