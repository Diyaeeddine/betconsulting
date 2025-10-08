<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Notification;
use Carbon\Carbon;

class Document extends Model
{
    protected $fillable = [
        'type',
        'code',
        'periodicite',
        'file_path',
        'date_expiration',
        'user_id',
        'archived',
        'is_complementary',
        'notes'
    ];

    protected $casts = [
        'date_expiration' => 'datetime',
        'archived' => 'boolean',
        'is_complementary' => 'boolean'
    ];

    protected static function boot()
    {
        parent::boot();

        // Auto-generate code when creating a document
        static::creating(function ($document) {
            if (!$document->code) {
                $prefix = $document->is_complementary ? 'COMP' : 'DOC';
                $year = now()->year;
                $lastDoc = self::where('code', 'like', "{$prefix}-{$year}-%")
                    ->orderBy('code', 'desc')
                    ->first();
                
                if ($lastDoc) {
                    $lastNumber = intval(substr($lastDoc->code, -3));
                    $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
                } else {
                    $newNumber = '001';
                }
                
                $document->code = "{$prefix}-{$year}-{$newNumber}";
            }
        });
    }

    /**
     * Périodicités fixes pour les documents standards
     */
    public static function getFixedPeriodicities()
    {
        return [
            'RC Mod.09' => 'annuel',
            'RC Mod.07' => 'trimestriel',
            'Attestation fiscal' => 'annuel',
            'Agrément' => 'annuel',
            'Chiffre d\'affaires' => 'annuel',
            'Attestation CNSS' => 'annuel',
            'Attestation salaries declares' => 'mensuel',
            'Bordereaux CNSS' => 'mensuel',
            'Déclaration salaires' => 'mensuel',
            'Attestation affiliation CNSS' => 'trimestriel'
        ];
    }

    /**
     * Retourne la date d'expiration selon la périodicité
     */
    public static function expirationFor(?string $periodicite): ?Carbon
    {
        return match ($periodicite) {
            'mensuel' => Carbon::now()->addMonth(),
            'trimestriel' => Carbon::now()->addMonths(3),
            'semestriel' => Carbon::now()->addMonths(6),
            'annuel' => Carbon::now()->addYear(),
            default => null,
        };
    }

    /**
     * Check if document is expiring soon
     */
    public function isExpiringSoon(): bool
    {
        if (!$this->date_expiration) return false;

        $daysUntilExpiration = now()->diffInDays($this->date_expiration, false);

        $thresholds = [
            'mensuel' => 7,
            'trimestriel' => 14,
            'semestriel' => 30,
            'annuel' => 60,
        ];

        $threshold = $thresholds[$this->periodicite] ?? 30;

        return $daysUntilExpiration <= $threshold && $daysUntilExpiration >= 0;
    }

    /**
     * Check if document is expired
     */
    public function isExpired(): bool
    {
        if (!$this->date_expiration) return false;
        return now()->isAfter($this->date_expiration);
    }

    /**
     * Get status with color
     */
    public function getStatusAttribute(): array
    {
        if (!$this->date_expiration) {
            return ['label' => 'Aucune expiration', 'color' => 'gray'];
        }

        $days = now()->diffInDays($this->date_expiration, false);

        if ($days < 0) {
            return ['label' => 'Expiré', 'color' => 'red', 'days' => abs($days)];
        }

        if ($days <= 7) {
            return ['label' => 'Urgent', 'color' => 'orange', 'days' => $days];
        }

        if ($days <= 30) {
            return ['label' => 'Attention', 'color' => 'yellow', 'days' => $days];
        }

        return ['label' => 'Valide', 'color' => 'green', 'days' => $days];
    }

    /**
     * Vérifier les documents qui expirent bientôt et notifier
     */
    public static function checkExpiringDocuments()
    {
        $documents = self::where('archived', false)
            ->whereNotNull('date_expiration')
            ->get();

        foreach ($documents as $document) {
            $daysUntilExpiration = now()->diffInDays($document->date_expiration, false);

            $thresholds = [
                'mensuel' => 7,
                'trimestriel' => 14,
                'semestriel' => 30,
                'annuel' => 60,
            ];

            $notifyBefore = $thresholds[$document->periodicite] ?? null;

            if ($notifyBefore && $daysUntilExpiration <= $notifyBefore && $daysUntilExpiration >= 0) {
                $existingNotification = Notification::where('user_id', $document->user_id)
                    ->where('type', 'document_expiration')
                    ->where('commentaire', 'like', '%' . $document->type . '%')
                    ->where('is_read', false)
                    ->first();

                if (!$existingNotification) {
                    Notification::create([
                        'user_id' => $document->user_id,
                        'titre' => 'Document bientôt expiré',
                        'commentaire' => "Le document '{$document->type}' ({$document->code}) expire dans {$daysUntilExpiration} jour(s). Veuillez le renouveler.",
                        'type' => 'document_expiration',
                        'is_read' => false,
                        'done' => false
                    ]);

                    event(new \App\Events\DocumentExpirationNotification($document));
                }
            }
        }
    }

    /**
     * Get file extension
     */
    public function getFileExtensionAttribute(): string
    {
        return pathinfo($this->file_path, PATHINFO_EXTENSION);
    }

    /**
     * Get file size in human readable format
     */
    public function getFileSizeAttribute(): string
    {
        $path = storage_path('app/public/' . $this->file_path);
        if (!file_exists($path)) return 'N/A';
        
        $bytes = filesize($path);
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('archived', false);
    }

    public function scopeArchived($query)
    {
        return $query->where('archived', true);
    }

    public function scopeStandard($query)
    {
        return $query->where('is_complementary', false);
    }

    public function scopeComplementary($query)
    {
        return $query->where('is_complementary', true);
    }

    public function scopeExpiring($query)
    {
        return $query->whereNotNull('date_expiration')
            ->where('date_expiration', '<=', now()->addDays(30))
            ->where('date_expiration', '>=', now());
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('date_expiration')
            ->where('date_expiration', '<', now());
    }
}