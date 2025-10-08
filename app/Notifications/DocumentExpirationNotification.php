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
            'document_type' => $this->document->type,
            'date_expiration' => $this->document->date_expiration,
            'days_until_expiration' => $this->daysUntilExpiration,
            'periodicite' => $this->document->periodicite,
            'titre' => $this->getTitre(),
            'commentaire' => $this->getCommentaire(),
            'priority' => $this->getPriority(),
            'action_required' => true,
            'icon' => $this->getIcon(),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'notification' => [
                'id' => uniqid(),
                'document_id' => $this->document->id,
                'document_type' => $this->document->type,
                'date_expiration' => $this->document->date_expiration,
                'days_until_expiration' => $this->daysUntilExpiration,
                'periodicite' => $this->document->periodicite,
                'titre' => $this->getTitre(),
                'commentaire' => $this->getCommentaire(),
                'priority' => $this->getPriority(),
                'action_required' => true,
                'icon' => $this->getIcon(),
                'created_at' => now()->toISOString(),
                'read_at' => null,
                'is_read' => false,
            ]
        ]);
    }

    private function getTitre(): string
    {
        $urgency = $this->getUrgencyLevel();
        
        switch ($urgency) {
            case 'critique':
                return "Document expire très bientôt !";
            case 'urgent':
                return "Action requise - Document bientôt expiré";
            case 'normal':
                return "Renouvellement de document requis";
            default:
                return "Document à renouveler";
        }
    }

    private function getCommentaire(): string
    {
        $dateFormatted = \Carbon\Carbon::parse($this->document->date_expiration)->format('d/m/Y');
        $urgency = $this->getUrgencyLevel();
        
        $baseMessage = "Le document '{$this->document->type}' ";
        
        if ($this->daysUntilExpiration <= 1) {
            $timeMessage = $this->daysUntilExpiration == 0 ? "expire aujourd'hui" : "expire demain";
        } else {
            $timeMessage = "expire dans {$this->daysUntilExpiration} jours";
        }
        
        $dateMessage = " (le {$dateFormatted}).";
        
        $actionMessage = match($urgency) {
            'critique' => " Action immédiate requise pour éviter toute interruption.",
            'urgent' => " Veuillez planifier le renouvellement rapidement.",
            'normal' => " Pensez à préparer les documents nécessaires pour le renouvellement.",
            default => " Renouvellement requis prochainement."
        };
        
        return $baseMessage . $timeMessage . $dateMessage . $actionMessage;
    }

    private function getPriority(): string
    {
        return $this->getUrgencyLevel();
    }

    private function getUrgencyLevel(): string
    {
        if ($this->daysUntilExpiration <= 2) {
            return 'critique';
        } elseif ($this->daysUntilExpiration <= 7) {
            return 'urgent';
        } elseif ($this->daysUntilExpiration <= 15) {
            return 'normal';
        } else {
            return 'info';
        }
    }

    private function getIcon(): string
    {
        return match($this->getUrgencyLevel()) {
            'critique' => '🚨',
            'urgent' => '⚠️',
            'normal' => '📋',
            default => '📄'
        };
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