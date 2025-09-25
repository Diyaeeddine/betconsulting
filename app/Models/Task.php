<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'nom', 'description', 'date_debut', 'date_fin', 'salaries_ids','statut', 'plan_id'
    ];

    protected $casts = [
        'salaries_ids' => 'array',
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}