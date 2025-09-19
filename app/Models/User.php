<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * Attributs ajoutés automatiquement dans les réponses JSON
     */
    protected $appends = ['role'];

    /**
     * Champs autorisés en écriture
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Champs cachés lors de la sérialisation (API, JSON, etc.)
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casting des colonnes
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Retourne le rôle principal de l’utilisateur
     */
    public function getRoleAttribute(): ?string
    {
        return $this->getRoleNames()->first();
    }
}
