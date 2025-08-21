<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profil extends Model
{
    use HasFactory;

    protected $table = 'profils';

    protected $fillable = [
        'user_id',
        'nom_profil',
        'poste_profil',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function salarie()
    {
        return $this->belongsTo(Salarie::class, 'user_id');
    }

    public static function getProfileTypes()
    {
        return [
            'bureau_etudes' => 'Bureau d\'Études Techniques (BET)',
            'construction' => 'Construction',
            'suivi_controle' => 'Suivi et Contrôle',
            'support_gestion' => 'Support et Gestion',
        ];
    }
}