<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\TacheDossier;
use App\Models\DocumentDossier;

class DossierMarche extends Model
{
    protected $table = 'dossiers_marche';
    
    protected $appends = ['pourcentage_avancement_numerique'];

    protected $with = ['taches'];

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

    // ✅ CORRECTION : Calcul de l'avancement + mise à jour automatique du statut
    public function calculerAvancement($forceTermine = false)
{
    $totalTaches = $this->taches()->count();
    
    if ($totalTaches === 0) {
        // Ne pas écraser si modification_requis
        if ($this->statut !== 'modification_requis') {
            $this->update([
                'pourcentage_avancement' => 0.00,
                'statut' => 'en_attente'
            ]);
        } else {
            $this->update(['pourcentage_avancement' => 0.00]);
        }
        return 0.00;
    }

    $tachesTerminees = $this->taches()
        ->whereIn('statut', ['terminee', 'validee'])
        ->count();
    
    $pourcentage = round(($tachesTerminees / $totalTaches) * 100, 2);
    
    // ✅ Si forceTermine = true (lors du remplacement de fichier)
    if ($forceTermine && $this->statut === 'modification_requis') {
        $toutesLesTachesTerminees = ($tachesTerminees === $totalTaches);
        
        if ($toutesLesTachesTerminees) {
            $this->update([
                'pourcentage_avancement' => 100.00,
                'statut' => 'termine',
                'date_finalisation' => now()
            ]);
        } else {
            // Pas toutes les tâches terminées, rester en modification_requis
            $this->update([
                'pourcentage_avancement' => (float) $pourcentage
            ]);
        }
    }
    // Si en modification_requis SANS forceTermine (comportement normal)
    elseif ($this->statut === 'modification_requis') {
        // Juste mettre à jour le pourcentage, PAS le statut
        $this->update([
            'pourcentage_avancement' => (float) $pourcentage
        ]);
    } 
    // Calcul normal pour les autres statuts
    else {
        $nouveauStatut = $this->determinerStatut($pourcentage, $totalTaches, $tachesTerminees);
        
        $this->update([
            'pourcentage_avancement' => (float) $pourcentage,
            'statut' => $nouveauStatut,
            'date_finalisation' => ($nouveauStatut === 'termine') ? now() : $this->date_finalisation
        ]);
    }
    
    return (float) $pourcentage;
}
    // ✅ Logique pour déterminer le statut du dossier
    private function determinerStatut($pourcentage, $totalTaches, $tachesTerminees)
    {
        // Si toutes les tâches sont terminées
        if ($tachesTerminees === $totalTaches && $totalTaches > 0) {
            return 'termine';
        }
        
        // Si au moins une tâche est en cours
        $tachesEnCours = $this->taches()->where('statut', 'en_cours')->count();
        if ($tachesEnCours > 0) {
            return 'en_cours';
        }
        
        // Si des tâches sont terminées mais pas toutes
        if ($tachesTerminees > 0 && $tachesTerminees < $totalTaches) {
            return 'en_cours';
        }
        
        // Sinon, en attente
        return 'en_attente';
    }

    // ✅ Méthode pour générer les tâches par défaut
    public function genererTachesParDefaut()
    {
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

public function getPourcentageAvancementNumeriqueAttribute()
{
    return (float) $this->pourcentage_avancement;
}

public function fichiers()
{
    return $this->hasMany(DocumentDossier::class, 'dossier_marche_id');
}

    
}