<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class TachePreparationNotification extends Notification implements ShouldBroadcast
{
    protected $tache;
    protected $projet;
    protected $dateEcheance;
    protected $priorite;
    protected $salarieId;

    /**
     * @param object $tache - La tâche assignée
     * @param string|null $projet - Nom du projet concerné
     * @param string|null $dateEcheance - Date d'échéance (format Y-m-d)
     * @param string $priorite - critique, urgent, normal, info
     */
    public function __construct($tache, ?string $projet = null, ?string $dateEcheance = null, string $priorite = 'normal')
    {
        $this->tache = $tache;
        $this->projet = $projet;
        $this->dateEcheance = $dateEcheance;
        $this->priorite = $priorite;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'tache_id' => $this->tache->id,
            'tache_titre' => $this->tache->titre ?? $this->tache->libelle ?? 'Nouvelle tâche',
            'projet' => $this->projet,
            'date_echeance' => $this->dateEcheance,
            'days_until_deadline' => $this->getDaysUntilDeadline(),
            'titre' => $this->getTitre(),
            'commentaire' => $this->getCommentaire(),
            'priority' => $this->priorite,
            'action_required' => true,
            'type' => 'tache_assignee',
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'notification' => [
                'id' => uniqid(),
                'tache_id' => $this->tache->id,
                'tache_titre' => $this->tache->titre ?? $this->tache->libelle ?? 'Nouvelle tâche',
                'projet' => $this->projet,
                'date_echeance' => $this->dateEcheance,
                'days_until_deadline' => $this->getDaysUntilDeadline(),
                'titre' => $this->getTitre(),
                'commentaire' => $this->getCommentaire(),
                'priority' => $this->priorite,
                'action_required' => true,
                'type' => 'tache_assignee',
                'created_at' => now()->toISOString(),
                'read_at' => null,
            ]
        ]);
    }

    private function getTitre(): string
    {
        switch ($this->priorite) {
            case 'critique':
                return "URGENT : Nouvelle tâche à traiter immédiatement !";
            case 'urgent':
                return "Tâche prioritaire assignée";
            case 'normal':
                return "Nouvelle tâche assignée";
            default:
                return "Nouvelle tâche disponible";
        }
    }

    private function getCommentaire(): string
    {
        $tacheTitre = $this->tache->titre ?? $this->tache->libelle ?? 'une tâche';
        $baseMessage = "Vous avez été assigné(e) à la tâche : {$tacheTitre}";
        
        if ($this->projet) {
            $baseMessage .= " (Projet : {$this->projet})";
        }
        
        if ($this->dateEcheance) {
            $dateFormatted = \Carbon\Carbon::parse($this->dateEcheance)->format('d/m/Y');
            $days = $this->getDaysUntilDeadline();
            
            if ($days === 0) {
                $baseMessage .= " - Échéance aujourd'hui !";
            } elseif ($days === 1) {
                $baseMessage .= " - Échéance demain";
            } elseif ($days > 0) {
                $baseMessage .= " - Échéance dans {$days} jours ({$dateFormatted})";
            } else {
                $baseMessage .= " - ATTENTION : Échéance dépassée !";
            }
        }
        
        $actionMessage = match($this->priorite) {
            'critique' => " Action immédiate requise !",
            'urgent' => " Veuillez commencer rapidement.",
            'normal' => " Merci de planifier votre travail.",
            default => ""
        };
        
        return $baseMessage . $actionMessage;
    }

    private function getDaysUntilDeadline(): ?int
    {
        if (!$this->dateEcheance) {
            return null;
        }

        return \Carbon\Carbon::now()->diffInDays(\Carbon\Carbon::parse($this->dateEcheance), false);
    }

    public function broadcastOn()
    {
        // IMPORTANT : Utiliser le canal salarie au lieu de user
        return new PrivateChannel('salarie.' . $this->tache->salarie_id ?? 'unknown');
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