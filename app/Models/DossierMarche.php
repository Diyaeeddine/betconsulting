<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\TacheDossier;

class DossierMarche extends Model
{
    protected $table = 'dossiers_marche';

    protected $fillable = [
        'marche_id',
        'type_dossier',
        'nom_dossier',
        'description',
        'statut',
        'pourcentage_avancement',
        'date_limite',
        'date_creation',
        'date_finalisation',
        'fichiers_joints',
        'commentaires'
    ];

    protected $casts = [
        'date_limite' => 'date',
        'date_creation' => 'date',
        'date_finalisation' => 'date',
        'fichiers_joints' => 'array',
        'pourcentage_avancement' => 'decimal:2'
    ];

    // Relations
    public function marchePublic(): BelongsTo
    {
        return $this->belongsTo(MarchePublic::class, 'marche_id');
    }

public function taches(): HasMany
{
    return $this->hasMany(TacheDossier::class, 'dossier_marche_id')
                ->orderBy('ordre');
}

public function calculerAvancement()
{
    $this->refresh();
    $this->load('taches');
    
    $totalTaches = $this->taches->count();
    
    if ($totalTaches === 0) {
        $this->update(['pourcentage_avancement' => 0]);
        return 0;
    }

    $tachesTerminees = $this->taches
        ->whereIn('statut', ['terminee', 'validee'])
        ->count();
    
    $pourcentage = round(($tachesTerminees / $totalTaches) * 100, 2);
    
    $this->update(['pourcentage_avancement' => $pourcentage]);
    
    return $pourcentage;
}

    public function genererTachesParDefaut()
    {
        // Tâches par défaut selon le type de dossier
        $tachesParDefaut = [
            'administratif' => [
                'Vérifier les documents légaux',
                'Préparer les certificats',
                'Rassembler les attestations',
                'Contrôler la conformité administrative'
            ],
            'technique' => [
                'Analyser les spécifications techniques',
                'Élaborer la méthodologie',
                'Préparer les plans techniques',
                'Rédiger le mémoire technique'
            ],
            'financier' => [
                'Établir le devis quantitatif',
                'Calculer les prix unitaires',
                'Préparer le bordereau des prix',
                'Vérifier la cohérence financière'
            ],
            'offre_technique' => [
                'Rédiger l\'offre technique',
                'Préparer les plannings',
                'Détailler les moyens techniques',
                'Présenter l\'équipe projet'
            ]
        ];

        $taches = $tachesParDefaut[$this->type_dossier] ?? [];
        
        foreach ($taches as $index => $nomTache) {
            TacheDossier::create([
                'dossier_marche_id' => $this->id,
                'nom_tache' => $nomTache,
                'priorite' => 'moyenne',
                'statut' => 'en_attente',
                'ordre' => $index + 1
            ]);
        }
    }
}