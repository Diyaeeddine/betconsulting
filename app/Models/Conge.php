<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Conge extends Model
{
    use HasFactory;

    protected $fillable = [
        'salarie_id',
        'date_debut',
        'date_fin',
        'type',
        'motif',
        'statut',
        'nombre_jours',
        'approuve_par',
        'date_approbation',
        'commentaire_approbation',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'date_approbation' => 'datetime',
    ];

    public function salarie(): BelongsTo
    {
        return $this->belongsTo(Salarie::class);
    }

    public function approbateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approuve_par');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($conge) {
            $conge->nombre_jours = Carbon::parse($conge->date_debut)
                ->diffInDays(Carbon::parse($conge->date_fin)) + 1;
        });
    }
}