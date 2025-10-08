<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class TestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $message) {}

    public function via($notifiable)
    {
        return ['database', 'broadcast']; // save + realtime
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'id' => uniqid(),
            'message' => $this->message,
            'read_at' => null,
        ]);
    }

    public function toArray($notifiable)
    {
        return [
            'message' => $this->message,
        ];
    }
}
