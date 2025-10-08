<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Traits\HasRoles;

class Salarie extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $guard = 'salarie';

    protected $fillable = [
        'nom',
        'prenom',
        'profil_id',
        'poste',
        'is_accepted',
        'email',
        'telephone',
        'salaire_mensuel',
        'date_embauche',
        'statut',
        'password',
        'emplacement',
        'user_id',
        'terrain_ids',
        'projet_ids',
        'contrat_cdi_path',
        'cv_path',
        'diplome_path',
        'certificat_travail_path',
    ];

    protected $casts = [
        'is_accepted'     => 'boolean',
        'salaire_mensuel' => 'decimal:2',
        'date_embauche'   => 'date',
        'projet_ids'      => 'array',
        'terrain_ids'     => 'array',
        'password'        => 'hashed',
    ];

    protected $attributes = [
        'projet_ids'   => '[]',
        'terrain_ids'  => '[]',
        'statut'       => 'actif',
        'emplacement'  => 'bureau',
        'is_accepted'  => false,
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // 🔹 Accessors
    public function getNameAttribute(): string
    {
        $prenom = $this->prenom ?? '';
        $nom = $this->nom ?? '';
        return trim("{$prenom} {$nom}") ?: 'Utilisateur';
    }

    public function getNomCompletAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    public function getInitialesAttribute(): string
    {
        return strtoupper(substr($this->prenom, 0, 1) . substr($this->nom, 0, 1));
    }

    // 🔹 Scopes
    public function scopeActif($query)
    {
        return $query->where('statut', 'actif');
    }

    public function scopeParProfil($query, $profil)
    {
        return $query->where('nom_profil', $profil);
    }

    // 🔹 Relations
    public function vehicule()
    {
        return $this->hasOne(Vehicule::class);
    }

    public function materiels()
    {
        return $this->hasMany(Materiel::class);
    }

    public function profils()
    {
        return $this->hasMany(Profil::class, 'user_id');
    }

    // Salarie.php
    public function profil() 
    {
        return $this->belongsTo(Profil::class);
    }



    public function projets()
    {
        return $this->belongsToMany(Projet::class, 'projet_salarie')
                    ->withTimestamps()
                    ->withPivot('date_affectation');
    }

    public function formations()
    {
        return $this->belongsToMany(Formation::class, 'formation_salarie')
                    ->withPivot(['statut', 'progression', 'note'])
                    ->withTimestamps();
    }

    public function affectations(): HasMany
    {
        return $this->hasMany(AffectationTache::class, 'salarie_id');
    }

    public function suivis(): HasMany
    {
        return $this->hasMany(SuiviTache::class, 'salarie_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }



    // Entritient
    public function entretiens()
    {
        return $this->hasMany(Entretien::class);
    }

    public function dernierEntretien()
    {
        return $this->hasOne(Entretien::class)->latestOfMany('date_entretien');
    }

   
    public function scoreMoyenEntretiens()
    {
        return $this->entretiens()
            ->avg('score_total');
    }
}
