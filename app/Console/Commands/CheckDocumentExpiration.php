<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Document;
use App\Models\User;
use App\Notifications\DocumentExpirationNotification;

class CheckDocumentExpiration extends Command
{
    protected $signature = 'documents:check-expiration';
    protected $description = 'Vérifie les documents expirant bientôt et envoie une notification';

    public function handle()
    {
        $documents = Document::where('archived', false)->get();

        foreach ($documents as $doc) {
            $periodicite = $doc->periodicite;
            $thresholds = [
                'mensuel' => 7,
                'trimestriel' => 14,
                'semestriel' => 30,
                'annuel' => 60,
            ];

            $threshold = $thresholds[$periodicite] ?? 30;

            if (!$doc->date_expiration) continue;

            $diffDays = now()->diffInDays($doc->date_expiration, false);

            if ($diffDays > 0 && $diffDays <= $threshold) {
                // Récupérer l'utilisateur
                $user = User::find($doc->user_id);
                
                if ($user) {
                    // Envoyer la notification (elle sera automatiquement stockée en BDD et broadcastée)
                    $user->notify(new DocumentExpirationNotification($doc, $diffDays));
                    $latestNotification = $user->notifications()->latest()->first();
                    event(new \App\Events\NewNotification($latestNotification, $user->id));
                    $this->info("Notification envoyée pour {$doc->type} à {$user->name}");
                }
            }
        }
    }
}