<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class TestNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public string $titre,
        public string $commentaire
    ) {}

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'titre' => $this->titre,
            'commentaire' => $this->commentaire,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'id' => uniqid(),
            'titre' => $this->titre,
            'commentaire' => $this->commentaire,
            'created_at' => now()->toDateTimeString(),
        ]);
    }

    // AJOUTEZ CES MÉTHODES :
    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->notifiable->id);
    }

    public function broadcastAs()
    {
        return 'notification.created';
    }
}