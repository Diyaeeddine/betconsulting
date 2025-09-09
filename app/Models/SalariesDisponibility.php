<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalariesDisponibility extends Model
{
    protected $table = 'salaries_disponibilities';

    protected $fillable = [
        'salaries_ids',
        'statut',
        'message',
        'recorded_at' => 'datetime:c',
    ];

    protected $casts = [
        'salaries_ids' => 'array', // Cast JSON to array
    ];
}

