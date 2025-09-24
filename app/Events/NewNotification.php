<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Notifications\DatabaseNotification;

class NewNotification implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $notification;
    public $userId;

    public function __construct(DatabaseNotification $notification, int $userId)
    {
        $this->notification = $notification;
        $this->userId = $userId;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->userId);
    }

    public function broadcastAs()
    {
        return 'notification.created';
    }

    public function broadcastWith()
    {
        $data = $this->notification->data;
        
        return [
            'notification' => [
                'id' => $this->notification->id,
                'type' => $this->notification->type,
                'read_at' => $this->notification->read_at,
                'created_at' => $this->notification->created_at->toDateTimeString(),
                
                'titre' => $data['titre'] ?? 'Notification',
                'commentaire' => $data['commentaire'] ?? '',
                'priority' => $data['priority'] ?? 'info',
                'icon' => $data['icon'] ?? '📄',
                'document_id' => $data['document_id'] ?? null,
                'document_type' => $data['document_type'] ?? null,
                'days_until_expiration' => $data['days_until_expiration'] ?? null,
                'date_expiration' => $data['date_expiration'] ?? null,
                'periodicite' => $data['periodicite'] ?? null,
                'action_required' => $data['action_required'] ?? false,
            ]
        ];
    }
}