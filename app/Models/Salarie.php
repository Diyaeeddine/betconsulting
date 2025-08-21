<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salarie extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom', 'prenom', 'poste', 'email', 'telephone',
        'salaire_mensuel', 'date_embauche', 'statut',
        'user_id'
    ];

    // This was conflicting with the many-to-many relationship

    public function vehicule()
    {
        return $this->hasOne(Vehicule::class);
    }

    public function materiels()
    {
        return $this->hasMany(Materiel::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Many-to-many relationship with Projet
     * This allows a salarie to be assigned to multiple projects
     */
    public function projets()
    {
        return $this->belongsToMany(Projet::class, 'projet_salarie')
                    ->withTimestamps()
                    ->withPivot('date_affectation');
    }
}
