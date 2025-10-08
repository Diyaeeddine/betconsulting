<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class BonCommande extends Model
{
    use HasFactory;

    protected $table = 'bons_commandes';

    protected $fillable = [
        'n_ordre',                 // N d'ordre
        'reference',               // Référence
        'date_heure_limite',       // Date/Heure limite
        'observation',             // Obsérvation
        'objet',                   // Objet
        'visite_lieux',            // Visite des lieux
        'ville_execution',         // Ville d'exécution
        'organisme',               // Organisme
        'telechargement_dao',      // Lien Télécharger D.A.O
        'lien_cliquer_ici',        // Lien "Cliquer ici"
        'type',                    // Type
        'soumission_electronique', // Soumission électronique
        'chemin_fichiers',         // Pour stocker les fichiers extraits
    ];

    protected $casts = [
        'chemin_fichiers' => 'array', // Cast JSON to array
        'date_heure_limite' => 'datetime', // Cast to Carbon instance
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'date_heure_limite',
        'created_at',
        'updated_at',
    ];

    // Scopes for filtering
    public function scopeByOrganisme($query, $organisme)
    {
        if ($organisme) {
            return $query->where('organisme', 'LIKE', "%{$organisme}%");
        }
        return $query;
    }

    public function scopeByVille($query, $ville)
    {
        if ($ville) {
            return $query->where('ville_execution', 'LIKE', "%{$ville}%");
        }
        return $query;
    }

    public function scopeByType($query, $type)
    {
        if ($type) {
            return $query->where('type', 'LIKE', "%{$type}%");
        }
        return $query;
    }

    public function scopeWithDao($query)
    {
        return $query->whereNotNull('telechargement_dao');
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('date_heure_limite')
              ->orWhere('date_heure_limite', '>', now());
        });
    }

    public function scopeExpired($query)
    {
        return $query->where('date_heure_limite', '<', now());
    }

    // Accessors
    public function getFormattedDateLimiteAttribute()
    {
        if ($this->date_heure_limite) {
            return $this->date_heure_limite->format('d/m/Y H:i');
        }
        return null;
    }

    public function getIsExpiredAttribute()
    {
        if ($this->date_heure_limite) {
            return $this->date_heure_limite->isPast();
        }
        return false;
    }

    public function getHasDaoFilesAttribute()
    {
        return !empty($this->telechargement_dao);
    }

    public function getHasExtractedFilesAttribute()
    {
        return !empty($this->chemin_fichiers) && is_array($this->chemin_fichiers);
    }

    public function getExtractedFilesCountAttribute()
    {
        if ($this->has_extracted_files) {
            return count($this->chemin_fichiers);
        }
        return 0;
    }

    // Mutators
    public function setNOrdreAttribute($value)
    {
        $this->attributes['n_ordre'] = $this->cleanString($value);
    }

    public function setReferenceAttribute($value)
    {
        $this->attributes['reference'] = $this->cleanString($value);
    }

    public function setObjetAttribute($value)
    {
        $this->attributes['objet'] = $this->cleanString($value);
    }

    public function setOrganismeAttribute($value)
    {
        $this->attributes['organisme'] = $this->cleanString($value);
    }

    public function setVilleExecutionAttribute($value)
    {
        $this->attributes['ville_execution'] = $this->cleanString($value);
    }

    public function setTypeAttribute($value)
    {
        $this->attributes['type'] = $this->cleanString($value);
    }

    public function setObservationAttribute($value)
    {
        $this->attributes['observation'] = $this->cleanString($value);
    }

    public function setVisiteLieuxAttribute($value)
    {
        $this->attributes['visite_lieux'] = $this->cleanString($value);
    }

    public function setSoumissionElectroniqueAttribute($value)
    {
        $this->attributes['soumission_electronique'] = $this->cleanString($value);
    }

    public function setTelechargementDaoAttribute($value)
    {
        $this->attributes['telechargement_dao'] = $this->cleanString($value);
    }

    public function setLienCliquerIciAttribute($value)
    {
        $this->attributes['lien_cliquer_ici'] = $this->cleanString($value);
    }

    // Helper methods
    private function cleanString($value)
    {
        if (!is_string($value)) {
            return null;
        }
        
        $cleaned = trim($value);
        return ($cleaned === '' || $cleaned === '' || $cleaned === 'N/A') ? null : $cleaned;
    }

    // Static methods for bulk operations
    public static function getUniqueOrganismes()
    {
        return static::whereNotNull('organisme')
            ->distinct()
            ->pluck('organisme')
            ->filter()
            ->sort()
            ->values();
    }

    public static function getUniqueVilles()
    {
        return static::whereNotNull('ville_execution')
            ->distinct()
            ->pluck('ville_execution')
            ->filter()
            ->sort()
            ->values();
    }

    public static function getUniqueTypes()
    {
        return static::whereNotNull('type')
            ->distinct()
            ->pluck('type')
            ->filter()
            ->sort()
            ->values();
    }

    public static function getStatistics()
    {
        return [
            'total' => static::count(),
            'with_dao' => static::withDao()->count(),
            'active' => static::active()->count(),
            'expired' => static::expired()->count(),
            'recent' => static::where('created_at', '>=', now()->subDays(7))->count(),
        ];
    }

    // Search functionality
    public function scopeSearch($query, $search)
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('n_ordre', 'LIKE', "%{$search}%")
              ->orWhere('reference', 'LIKE', "%{$search}%")
              ->orWhere('objet', 'LIKE', "%{$search}%")
              ->orWhere('organisme', 'LIKE', "%{$search}%")
              ->orWhere('ville_execution', 'LIKE', "%{$search}%")
              ->orWhere('type', 'LIKE', "%{$search}%");
        });
    }

    // Validation rules
    public static function validationRules()
    {
        return [
            'n_ordre' => 'nullable|string|max:255',
            'reference' => 'nullable|string|max:255',
            'date_heure_limite' => 'nullable|date',
            'objet' => 'nullable|string',
            'organisme' => 'nullable|string|max:500',
            'ville_execution' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'observation' => 'nullable|string',
            'visite_lieux' => 'nullable|string|max:500',
            'telechargement_dao' => 'nullable|url|max:1000',
            'lien_cliquer_ici' => 'nullable|url|max:1000',
            'soumission_electronique' => 'nullable|string|max:500',
            'chemin_fichiers' => 'nullable|array',
        ];
    }

    // Export functionality
    public function toExportArray()
    {
        return [
            'N° d\'ordre' => $this->n_ordre,
            'Référence' => $this->reference,
            'Date/Heure limite' => $this->formatted_date_limite,
            'Objet' => $this->objet,
            'Organisme' => $this->organisme,
            'Ville d\'exécution' => $this->ville_execution,
            'Type' => $this->type,
            'Observation' => $this->observation,
            'Visite des lieux' => $this->visite_lieux,
            'Soumission électronique' => $this->soumission_electronique,
            'Téléchargement DAO' => $this->telechargement_dao,
            'Lien détails' => $this->lien_cliquer_ici,
            'Fichiers extraits' => $this->extracted_files_count,
            'Date création' => $this->created_at ? $this->created_at->format('d/m/Y H:i') : null,
            'Statut' => $this->is_expired ? 'Expiré' : 'Actif',
        ];
    }
}