<?php

namespace App\Notifications;

use App\Models\Entretien;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class EntretienValidationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $entretien;
    protected $salarie;

    /**
     * Create a new notification instance.
     */
    public function __construct(Entretien $entretien)
    {
        $this->entretien = $entretien;
        $this->salarie = $entretien->salarie;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return [
            'titre' => 'Nouvel entretien à valider',
            'commentaire' => sprintf(
                'L\'entretien de %s pour le poste de %s nécessite votre validation.',
                $this->salarie->nom_complet,
                $this->entretien->poste_vise
            ),
            'priority' => 'urgent',
            'icon' => '📋',
            'document_id' => $this->entretien->id,
            'document_type' => 'entretien',
            'salarie_id' => $this->salarie->id,
            'salarie_nom' => $this->salarie->nom_complet,
            'poste_vise' => $this->entretien->poste_vise,
            'score_total' => $this->entretien->score_total,
            'pourcentage' => $this->entretien->pourcentage_score,
            'appreciation' => $this->entretien->appreciation,
            'recommandation' => $this->entretien->recommandation,
            'date_entretien' => $this->entretien->date_entretien->format('d/m/Y'),
            'url' => '/direction-generale/salarie-decision',
            'action_required' => true,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}