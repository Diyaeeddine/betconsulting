<?php

namespace App\Notifications;

use App\Models\MarchePublic;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class MarcheDecisionNotification extends Notification implements ShouldBroadcast
{
    public MarchePublic $marche;
    public string $decision; // 'accepte' ou 'refuse'

    public function __construct(MarchePublic $marche, string $decision)
    {
        $this->marche = $marche;
        $this->decision = $decision;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'marche_id' => $this->marche->id,
            'reference' => $this->marche->n_reference,
            'objet' => $this->marche->objet,
            'type_ao' => $this->marche->type_ao,
            'estimation' => $this->marche->estimation,
            'date_limite' => $this->marche->date_limite,
            'decision' => $this->decision,
            'date_decision' => $this->marche->date_decision,
            'titre' => $this->getTitre(),
            'commentaire' => $this->getCommentaire(),
            'priority' => $this->getPriority(),
            'action_required' => $this->isActionRequired(),
            // 'icon' => $this->getIcon(),
            'type' => 'marche_decision',
            // Compatibilité avec votre système existant
            'document_type' => 'Marché Public - ' . $this->marche->type_ao,
            'days_until_expiration' => $this->getDaysUntilDeadline(),
            'date_expiration' => $this->marche->date_limite,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'notification' => [
                'id' => uniqid(),
                'marche_id' => $this->marche->id,
                'reference' => $this->marche->n_reference,
                'objet' => $this->marche->objet,
                'type_ao' => $this->marche->type_ao,
                'estimation' => $this->marche->estimation,
                'date_limite' => $this->marche->date_limite,
                'decision' => $this->decision,
                'date_decision' => $this->marche->date_decision,
                'titre' => $this->getTitre(),
                'commentaire' => $this->getCommentaire(),
                'priority' => $this->getPriority(),
                'action_required' => $this->isActionRequired(),
                // 'icon' => $this->getIcon(),
                'type' => 'marche_decision',
                // Compatibilité avec votre système existant
                'document_type' => 'Marché Public - ' . $this->marche->type_ao,
                'days_until_expiration' => $this->getDaysUntilDeadline(),
                'date_expiration' => $this->marche->date_limite,
                'created_at' => now()->toISOString(),
                'read_at' => null,
                'is_read' => false,
            ]
        ]);
    }

    private function getTitre(): string
    {
        if ($this->decision === 'accepte') {
            $urgency = $this->getUrgencyLevel();
            
            switch ($urgency) {
                case 'critique':
                    return "Marché accepté - Action URGENTE requise !";
                case 'urgent':
                    return "Marché accepté - Préparation du dossier";
                case 'normal':
                    return "Nouveau marché accepté à traiter";
                default:
                    return "Marché public accepté";
            }
        } else {
            return "Marché public refusé";
        }
    }

    private function getCommentaire(): string
    {
        $baseMessage = "Marché '{$this->marche->n_reference}' ({$this->marche->objet})";
        
        if ($this->decision === 'accepte') {
            $dateFormatted = $this->marche->date_limite ? 
                \Carbon\Carbon::parse($this->marche->date_limite)->format('d/m/Y') : 
                'Non définie';
            
            $urgency = $this->getUrgencyLevel();
            
            $actionMessage = match($urgency) {
                'critique' => " URGENT : Préparer le dossier administratif immédiatement !",
                'urgent' => " Action requise : Préparation du dossier administratif.",
                'normal' => " Merci de préparer le dossier administratif.",
                default => " Dossier administratif à préparer."
            };
            
            return $baseMessage . " a été accepté par la Direction Générale. Date limite: {$dateFormatted}." . $actionMessage;
        } else {
            $motif = $this->marche->commentaire_refus ?? "Critères non conformes";
            return $baseMessage . " a été refusé. Motif: {$motif}";
        }
    }

    private function getPriority(): string
    {
        if ($this->decision === 'refuse') {
            return 'info';
        }
        
        return $this->getUrgencyLevel();
    }

    private function isActionRequired(): bool
    {
        return $this->decision === 'accepte';
    }

    private function getUrgencyLevel(): string
    {
        if (!$this->marche->date_limite) {
            return 'normal';
        }

        $daysUntilDeadline = \Carbon\Carbon::now()->diffInDays(\Carbon\Carbon::parse($this->marche->date_limite), false);
        
        if ($daysUntilDeadline <= 5) {
            return 'critique';
        } elseif ($daysUntilDeadline <= 10) {
            return 'urgent';
        } elseif ($daysUntilDeadline <= 20) {
            return 'normal';
        } else {
            return 'info';
        }
    }

    private function getDaysUntilDeadline(): ?int
    {
        if (!$this->marche->date_limite) {
            return null;
        }

        return \Carbon\Carbon::now()->diffInDays(\Carbon\Carbon::parse($this->marche->date_limite), false);
    }

    public function broadcastOn()
    {
        // Obtenir l'utilisateur avec le rôle "etudes-techniques"
        $etudesTechniques = \App\Models\User::whereHas('roles', function($query) {
            $query->where('name', 'etudes-techniques');
        })->first();

        if ($etudesTechniques) {
            return new PrivateChannel('user.' . $etudesTechniques->id);
        }

        // Fallback: diffuser à tous les utilisateurs "etudes-techniques"
        return new PrivateChannel('etudes-techniques-global');
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