<?php

namespace App\Notifications;

use App\Models\Document;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ValidationProfileNotification extends Notification implements ShouldBroadcast
{
    protected $salarie;
    protected $notifiable; // Ajouter cette propriété

    public function __construct($salarie)
    {
        $this->salarie = $salarie;
    }

    public function via($notifiable)
    {
        $this->notifiable = $notifiable; // Stocker le destinataire
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'titre' => 'Nouveau salarié à valider',
            'commentaire' => "Le salarié {$this->salarie->nom} {$this->salarie->prenom} a été créé.",
            'salarie_id' => $this->salarie->id,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'id' => uniqid(),
            'titre' => 'Nouveau salarié à valider',
            'commentaire' => "Le salarié {$this->salarie->nom} {$this->salarie->prenom} a été créé.",
            'salarie_id' => $this->salarie->id,
            'created_at' => now()->toISOString(),
            'read_at' => null,
            'is_read' => false,
        ]);
    }

    public function broadcastAs()
    {
        return 'notification.created';
    }

    public function broadcastOn()
    {
        // ✅ Diffuser sur le canal de l'admin destinataire
        return new PrivateChannel('user.' . $this->notifiable->id);
    }
}