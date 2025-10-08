<?php

namespace App\Console\Commands;
use Illuminate\Console\Command;
use App\Models\Document;
use App\Models\User;
use App\Notifications\DocumentExpirationNotification;
use App\Events\NewNotification;
use Illuminate\Support\Str;
use Exception;

class CheckDocumentsExpiration extends Command

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

            if (!$doc->date_expiration) {
                continue;
            }

            $diffDays = now()->diffInDays($doc->date_expiration, false);

            if ($diffDays > 0 && $diffDays <= $threshold) {
                $user = User::find($doc->user_id);

                if (!$user) {
                    $this->warn("Aucun utilisateur trouvé pour le document id={$doc->id}");
                    continue;
                }

                try {
                    $notifData = (new DocumentExpirationNotification($doc, $diffDays))->toDatabase($user);

                    $notificationId = (string) Str::uuid();
                    
                    $notification = $user->notifications()->create([
                        'id'   => $notificationId,
                        'type' => DocumentExpirationNotification::class,
                        'data' => $notifData,
                    ]);

                    // SOLUTION : Récupérer la notification directement depuis la base avec toutes ses données
                    $fullNotification = $user->notifications()->where('id', $notificationId)->first();

                    if ($fullNotification) {
                        event(new NewNotification($fullNotification, $user->id));
                        $this->info("Notification envoyée pour document '{$doc->type}' (doc_id={$doc->id}) à {$user->name} (user_id={$user->id})");
                    } else {
                        $this->error("Notification créée mais non trouvée pour doc_id={$doc->id}");
                    }
                } catch (Exception $e) {
                    $this->error("Erreur lors de l'envoi de la notification pour doc_id={$doc->id} : " . $e->getMessage());
                }
            }
        }
    }
}