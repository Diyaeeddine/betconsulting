<?php

namespace App\Notifications;

use App\Models\MarchePublic;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class MarcheValidationAdminNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public MarchePublic $marche;
    public string $serviceOrigine;

    public function __construct(MarchePublic $marche, string $serviceOrigine = "Service Marketing")
    {
        $this->marche = $marche;
        $this->serviceOrigine = $serviceOrigine;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'marche_id'   => $this->marche->id,
            'reference'   => $this->marche->n_reference,
            'objet'       => $this->marche->objet,
            'titre'       => "Validation requise par la Direction Générale",
            'commentaire' => "Le marché '{$this->marche->n_reference}' ({$this->marche->objet}) a été accepté par {$this->serviceOrigine}. Merci de valider ce marché.",
            'priority'    => 'critique',
            'type'        => 'marche_validation_admin',
            'date'        => now()->toDateTimeString(),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'notification' => [
                'id'          => uniqid(),
                'marche_id'   => $this->marche->id,
                'reference'   => $this->marche->n_reference,
                'objet'       => $this->marche->objet,
                'titre'       => "Validation requise par la Direction Générale",
                'commentaire' => "Le marché '{$this->marche->n_reference}' ({$this->marche->objet}) a été accepté par {$this->serviceOrigine}. Merci de valider ce marché.",
                'priority'    => 'critique',
                'type'        => 'marche_validation_admin',
                'created_at'  => now()->toISOString(),
                'read_at'     => null,
                'is_read'     => false,
            ]
        ]);
    }

    public function broadcastOn()
    {
        return new PrivateChannel('admin-global');
    }

    public function broadcastAs()
    {
        return 'notification.created';
    }
}