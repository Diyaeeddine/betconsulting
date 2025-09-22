<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Logiciel extends Model
{
    use HasFactory;

    // Define the table if it's not the plural form of the model
    protected $table = 'logiciels';

    // Fillable attributes for mass assignment
    protected $fillable = [
        'name',
        'domaine',
        'description',
        'output',
        'statut',
    ];

    // If you want to cast the statut attribute into a specific type
    protected $casts = [
        'statut' => 'string',
    ];
     
    
    public function salaries()
    {
        return $this->hasMany(Salarie::class, 'logiciel_id');
    }
}