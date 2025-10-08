<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * Champs autorisés en écriture
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Champs cachés lors de la sérialisation (API, JSON, etc.)
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attributs ajoutés automatiquement dans les réponses JSON
     *
     * @var list<string>
     */
    protected $appends = ['role'];

    /**
     * Casting des colonnes
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Retourne le rôle principal de l'utilisateur
     */
    public function getRoleAttribute(): ?string
    {
        return $this->getRoleNames()->first();
    }

    /**
     * Relation Many-to-Many avec les projets
     */
    public function projets()
    {
        return $this->belongsToMany(Projet::class, 'projet_user')
                    ->withPivot(['date_affectation', 'statut', 'notes'])
                    ->withTimestamps();
    }

    /**
     * Projets actifs uniquement
     */
    public function activeProjets()
    {
        return $this->belongsToMany(Projet::class, 'projet_user')
                    ->wherePivot('statut', 'actif')
                    ->withPivot(['date_affectation', 'statut', 'notes'])
                    ->withTimestamps();
    }

    /**
     * Relation One-to-One avec salarié
     */
    public function salarie()
    {
        return $this->hasOne(Salarie::class);
    }

    /**
     * Relation One-to-Many avec vos notifications personnalisées
     */
    public function myNotifications()
    {
        return $this->hasMany(\App\Models\Notification::class, 'user_id');
    }

    /**
     * Relation One-to-Many pour les notifications envoyées par l'utilisateur
     */
    public function sentNotifications()
    {
        return $this->hasMany(\App\Models\Notification::class, 'source_user_id');
    }

    public function references()
    {
        return $this->hasMany(Reference::class);
    }
}
