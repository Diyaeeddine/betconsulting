<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SousTrait extends Model
{
    use HasFactory;

    protected $table = 'sous_traits';

    protected $fillable = [
        'nom',
        'poste',
        'description',
        'formation',
        'experience',
        'competences',
        'autre',
    ];

    protected $casts = [
        'formation'   => 'array',
        'experience'  => 'array',
        'competences' => 'array',
    ];
}