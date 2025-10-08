<?php

namespace App\Notifications;

use App\Models\Entretien;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class EntretienValideNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $entretien;
    protected $accepte;

    public function __construct(Entretien $entretien, bool $accepte)
    {
        $this->entretien = $entretien;
        $this->accepte = $accepte;
    }

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        $titre = $this->accepte 
            ? 'Entretien validé - Candidat accepté' 
            : 'Entretien validé - Candidat refusé';
        
        $commentaire = sprintf(
            'L\'entretien de %s a été %s par la direction générale.',
            $this->entretien->salarie->nom_complet,
            $this->accepte ? 'validé et le candidat accepté' : 'validé mais le candidat refusé'
        );

        return [
            'titre' => $titre,
            'commentaire' => $commentaire,
            'priority' => $this->accepte ? 'info' : 'normal',
            'icon' => $this->accepte ? '✅' : 'ℹ️',
            'document_id' => $this->entretien->id,
            'document_type' => 'entretien',
            'salarie_id' => $this->entretien->salarie_id,
            'salarie_nom' => $this->entretien->salarie->nom_complet,
            'accepte' => $this->accepte,
            'url' => '/ressources-humaines/entretiens',
            'action_required' => false,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}