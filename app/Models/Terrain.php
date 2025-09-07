<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Terrain extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'points',
        'surface',
        'radius',
        'projet_id',
        'statut_tech',
        'statut_final',
        'salarie_ids',
    ];

    protected $casts = [
        'points' => 'array',
        'salarie_ids' => 'array',
    ];
    protected $attributes = [
        'salarie_ids' => '[]',
    ];
    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function salaries()
    {
        return Salarie::query()
            ->whereIn('id', $this->salarie_ids ?? [])
            ->get();
    }

    public function updateStatuses(string $statutTech, string $statutFinal): bool
    {
        $this->statut_tech = $statutTech;
        $this->statut_final = $statutFinal;
        return $this->save();
    }
}