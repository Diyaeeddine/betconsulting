<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // ⚠️ Envoi immédiat
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;

class NewNotification implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->notification->user_id);
    }

    public function broadcastAs()
    {
        // Nom de l'événement côté frontend
        return 'notification.created';
    }

    public function broadcastWith()
    {
        // Format des données envoyées au frontend
        return [
            'notification' => [
                'id' => $this->notification->id,
                'titre' => $this->notification->titre,
                'commentaire' => $this->notification->commentaire,
                'created_at' => $this->notification->created_at->toDateTimeString(),
            ]
        ];
    }
}
