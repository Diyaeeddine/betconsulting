<?php

namespace App\Notifications;

use App\Models\DemandeProfil;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NouvelleDemandeProfils extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public DemandeProfil $demande
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'demande_id' => $this->demande->id,
            'titre' => $this->demande->titre_demande,
            'demandeur' => $this->demande->demandeur->name,
            'urgence' => $this->demande->urgence,
            'nombre_profils' => $this->demande->details->sum('quantite'),
            'message' => "Nouvelle demande de profils : {$this->demande->titre_demande}",
            'url' => '/profils/demandes',
            'created_at' => now()->toDateTimeString(),
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'demande_id' => $this->demande->id,
            'titre' => $this->demande->titre_demande,
            'demandeur' => $this->demande->demandeur->name,
            'urgence' => $this->demande->urgence,
            'nombre_profils' => $this->demande->details->sum('quantite'),
            'message' => "Nouvelle demande de profils : {$this->demande->titre_demande}",
            'type' => 'nouvelle_demande_profils',
        ]);
    }

    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'nouvelle-demande-profils';
    }
}