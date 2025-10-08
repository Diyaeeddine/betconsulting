<?php

namespace App\Notifications;

use App\Models\Entretien;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class EntretienRejeteNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $entretien;

    public function __construct(Entretien $entretien)
    {
        $this->entretien = $entretien;
    }

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'titre' => 'Entretien rejeté',
            'commentaire' => sprintf(
                'L\'entretien de %s a été rejeté par la direction générale. Motif : %s',
                $this->entretien->salarie->nom_complet,
                $this->entretien->motif_rejet
            ),
            'priority' => 'urgent',
            'icon' => '❌',
            'document_id' => $this->entretien->id,
            'document_type' => 'entretien',
            'salarie_id' => $this->entretien->salarie_id,
            'salarie_nom' => $this->entretien->salarie->nom_complet,
            'motif_rejet' => $this->entretien->motif_rejet,
            'url' => '/ressources-humaines/entretiens',
            'action_required' => true,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}