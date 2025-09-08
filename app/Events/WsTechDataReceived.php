<?php


namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class WsTechDataReceived implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $data;

    // Constructor now accepts data to broadcast
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    // Broadcasts the data to the private channel for the salary
    public function broadcastOn(): array
    {
        return [new PrivateChannel('salarie.' . $this->data['salarie_id'])];
    }

    // Broadcast data structure
    public function broadcastWith()
    {
        return $this->data; // Ensure this matches the structure you're passing
    }
}
