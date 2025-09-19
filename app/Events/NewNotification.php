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
        return [
            'notification' => [
                'id' => $this->notification->id,
                'type' => $this->notification->type,
                'data' => $this->notification->data,
                'created_at' => $this->notification->created_at->toDateTimeString(),
                'read_at' => $this->notification->read_at,
            ]
        ];
    }
}