<?php

// app/Models/Terrain.php (Updated to work with Users)
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
        'salarie_ids', // Keep for backward compatibility, but consider changing to user_ids
        'user_ids', // NEW: Store user IDs instead of salarie IDs
    ];

    protected $casts = [
        'points' => 'array',
        'salarie_ids' => 'array', // Keep for backward compatibility
        'user_ids' => 'array', // NEW: User IDs
    ];
    
    protected $attributes = [
        'salarie_ids' => '[]',
        'user_ids' => '[]', // NEW
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    // OLD: Keep for backward compatibility
    public function salaries()
    {
        return Salarie::query()
            ->whereIn('id', $this->salarie_ids ?? [])
            ->get();
    }

    // NEW: Get users assigned to this terrain
    public function users()
    {
        return User::query()
            ->whereIn('id', $this->user_ids ?? [])
            ->get();
    }

    // NEW: Get users assigned to the terrain's project
    public function getProjectUsers()
    {
        if ($this->projet) {
            return $this->projet->activeUsers;
        }
        return collect();
    }

    // NEW: Get available users (project users not yet assigned to this terrain)
    public function getAvailableUsers()
    {
        $projectUserIds = $this->getProjectUsers()->pluck('id')->toArray();
        $terrainUserIds = $this->user_ids ?? [];
        
        $availableUserIds = array_diff($projectUserIds, $terrainUserIds);
        
        return User::whereIn('id', $availableUserIds)->get();
    }

    public function updateStatuses(string $statutTech, string $statutFinal): bool
    {
        $this->statut_tech = $statutTech;
        $this->statut_final = $statutFinal;
        return $this->save();
    }
}