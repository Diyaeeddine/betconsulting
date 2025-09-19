<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Notification;
use Carbon\Carbon;

class Document extends Model
{
    protected $fillable = [
        'type',
        'periodicite', 
        'file_path',
        'date_expiration',
        'user_id',
        'archived',
        'is_complementary'
    ];

    protected $casts = [
        'date_expiration' => 'datetime',
        'archived' => 'boolean',
        'is_complementary' => 'boolean'
    ];

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
     * Retourne la date d’expiration selon la périodicité
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
                        'commentaire' => "Le document '{$document->type}' expire dans {$daysUntilExpiration} jour(s). Veuillez le renouveler.",
                        'type' => 'document_expiration',
                        'is_read' => false,
                        'done' => false
                    ]);

                    event(new \App\Events\DocumentExpirationNotification($document));
                }
            }
        }
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
