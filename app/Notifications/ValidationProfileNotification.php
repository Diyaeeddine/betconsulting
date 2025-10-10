<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ValidationProfileNotification extends Notification implements ShouldBroadcast
{
    protected $salarie;
    protected $notifiable;

    public function __construct($salarie)
    {
        $this->salarie = $salarie;
    }

    public function via($notifiable)
    {
        $this->notifiable = $notifiable;
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'salarie_id' => $this->salarie->id,
            'salarie_nom' => $this->salarie->nom,
            'salarie_prenom' => $this->salarie->prenom,
            'salarie_matricule' => $this->salarie->matricule ?? null,
            'titre' => $this->getTitre(),
            'commentaire' => $this->getCommentaire(),
            'priority' => $this->getPriority(),
            'action_required' => true,
            'type' => 'validation_profile_salarie',
            'document_type' => 'Validation Profil Salarie',
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'notification' => [
                'id' => uniqid(),
                'salarie_id' => $this->salarie->id,
                'salarie_nom' => $this->salarie->nom,
                'salarie_prenom' => $this->salarie->prenom,
                'salarie_matricule' => $this->salarie->matricule ?? null,
                'titre' => $this->getTitre(),
                'commentaire' => $this->getCommentaire(),
                'priority' => $this->getPriority(),
                'action_required' => true,
                'type' => 'validation_profile_salarie',
                'document_type' => 'Validation Profil Salarie',
                'created_at' => now()->toISOString(),
                'read_at' => null,
                'is_read' => false,
            ]
        ]);
    }

    private function getTitre(): string
    {
        return "Nouveau salarie a valider";
    }

    private function getCommentaire(): string
    {
        $baseMessage = "Le profil du salarie {$this->salarie->nom} {$this->salarie->prenom}";
        
        if (isset($this->salarie->matricule)) {
            $baseMessage .= " (Matricule: {$this->salarie->matricule})";
        }
        
        $actionMessage = " a ete cree. Merci de proceder a la validation du profil.";
        
        return $baseMessage . $actionMessage;
    }

    private function getPriority(): string
    {
        return 'urgent';
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->notifiable->id);
    }

    public function broadcastAs()
    {
        return 'notification.created';
    }

    public function broadcastWhen()
    {
        return true;
    }
}