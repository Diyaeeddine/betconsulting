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
        'email', 
        'telephone',
        'salaire_mensuel', 
        'date_embauche', 
        'statut', 
        'projet_ids'
    ];

    protected $casts = [
        'projet_ids' => 'array',  // JSON array of project IDs
    ];

    public function vehicule()
    {
        return $this->hasOne(Vehicule::class);
    }

    public function materiels()
    {
        return $this->hasMany(Materiel::class);
    }

    // One salarie can have multiple profils
    public function profils()
    {
        return $this->hasMany(Profil::class, 'user_id');
    }
}