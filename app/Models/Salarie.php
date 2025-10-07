<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Traits\HasRoles;
class Salarie extends Authenticatable 
{
    use HasFactory, Notifiable, HasRoles ;
    protected $guard = 'salarie';
    protected $fillable = [
        'nom', 
        'prenom', 
        'nom_profil',
        'poste',
        'is_accepted',
        'email', 
        'telephone',
        'salaire_mensuel', 
        'date_embauche', 
        'statut', 
        'password',
        'projet_ids'
    ];

    protected $casts = [
        'is_accepted' => 'boolean',
        'salaire_mensuel' => 'decimal:2',
        'date_embauche' => 'date',
        'projet_ids' => 'array',
        'password' => 'hashed', 
    ];

    protected $hidden = [
        'password',
        'remember_token',  
    ];

public function getNameAttribute(): string
{
    $prenom = $this->prenom ?? '';
    $nom = $this->nom ?? '';
    return trim("{$prenom} {$nom}") ?: 'Utilisateur';
}


    // Relations existantes
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

    public function formations() {
        return $this->belongsToMany(Formation::class, 'formation_salarie')
            ->withPivot(['statut', 'progression', 'note'])
            ->withTimestamps();
    }

    public function affectations(): HasMany {
        return $this->hasMany(AffectationTache::class, 'salarie_id');
    }

    // public function suivis(): HasMany {
    //     return $this->hasMany(SuiviTache::class, 'salarie_id');
    // }

    // Scopes
    public function scopeActif($query) {
        return $query->where('statut', 'actif');
    }

    public function scopeParProfil($query, $profil) {
        return $query->where('nom_profil', $profil);
    }

    // Accessors
    public function getNomCompletAttribute() {
        return "{$this->prenom} {$this->nom}";
    }

    public function getInitialesAttribute() {
        return strtoupper(substr($this->prenom, 0, 1) . substr($this->nom, 0, 1));
    }

    public function conges()
        
        {
            return $this->hasMany(Conge::class);
        }

        public function certificatsMedicaux()
        {
            return $this->hasMany(CertificatMedical::class);
        }
}