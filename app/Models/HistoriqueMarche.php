<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoriqueMarche extends Model
{
    protected $table = 'historiques_marche';

    protected $fillable = [
        'marche_id',
        'dossier_id',
        'tache_id',
        'user_id',
        'type_evenement',
        'etape_precedente',
        'etape_nouvelle',
        'statut_precedent',
        'statut_nouveau',
        'description',
        'commentaire',
        'donnees_supplementaires',
        'date_evenement',
        'duree_execution',
        'role_utilisateur',
        'ip_address'
    ];

    protected $casts = [
        'date_evenement' => 'datetime',
        'duree_execution' => 'decimal:2',
        'donnees_supplementaires' => 'array'
    ];

    public function marche(): BelongsTo
    {
        return $this->belongsTo(MarchePublic::class, 'marche_id');
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(DossierMarche::class, 'dossier_id');
    }

    public function tache(): BelongsTo
    {
        return $this->belongsTo(TacheDossier::class, 'tache_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Helper pour enregistrer facilement
    public static function enregistrer(
        int $marcheId,
        string $typeEvenement,
        string $description,
        ?int $dossierId = null,
        ?int $tacheId = null,
        ?string $commentaire = null,
        ?array $donneesSupp = null
    ) {
        return self::create([
            'marche_id' => $marcheId,
            'dossier_id' => $dossierId,
            'tache_id' => $tacheId,
            'user_id' => auth()->id(),
            'type_evenement' => $typeEvenement,
            'description' => $description,
            'commentaire' => $commentaire,
            'donnees_supplementaires' => $donneesSupp,
            'role_utilisateur' => auth()->user()?->roles->first()?->name,
            'ip_address' => request()->ip(),
            'date_evenement' => now()
        ]);
    }
}