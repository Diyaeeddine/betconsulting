<?php

namespace App\Notifications;

use App\Models\Document;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class DocumentExpirationNotification extends Notification implements ShouldBroadcast
{
    public Document $document;
    public int $daysUntilExpiration;

    public function __construct(Document $document, int $daysUntilExpiration)
    {
        $this->document = $document;
        $this->daysUntilExpiration = $daysUntilExpiration;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'document_id' => $this->document->id,
            'type' => $this->document->type,
            'date_expiration' => $this->document->date_expiration,
            'titre' => 'Document bientôt expiré',
            'commentaire' => "Le document {$this->document->type} expire dans {$this->daysUntilExpiration} jour(s).",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'notification' => [
                'id' => uniqid(),
                'document_id' => $this->document->id,
                'type' => $this->document->type,
                'date_expiration' => $this->document->date_expiration,
                'titre' => 'Document bientôt expiré',
                'commentaire' => "Le document {$this->document->type} expire dans {$this->daysUntilExpiration} jour(s).",
                'created_at' => now()->toISOString(),
                'read_at' => null,
                'is_read' => false,
            ]
        ]);
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->document->user_id);
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
