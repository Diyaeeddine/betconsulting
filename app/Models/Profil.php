<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Profil extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nom_profil',
        'type_profil',
    ];

    public function salarie()
    {
        return $this->belongsTo(Salarie::class, 'user_id');
    }
}