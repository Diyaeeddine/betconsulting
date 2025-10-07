<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CertificatMedical extends Model
{
    use HasFactory;

    protected $table = 'certificats_medicaux';

    protected $fillable = [
        'salarie_id',
        'date_debut',
        'date_fin',
        'fichier_path',
        'fichier_original',
        'description',
        'statut',
        'valide_par',
        'date_validation',
        'commentaire_validation',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'date_validation' => 'datetime',
    ];

    public function salarie(): BelongsTo
    {
        return $this->belongsTo(Salarie::class);
    }

    public function validateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par');
    }
}