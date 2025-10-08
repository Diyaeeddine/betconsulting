<?php

namespace App\Notifications;

use App\Models\Reference;
use App\Events\NewNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReferenceValidatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $reference;

    /**
     * Create a new notification instance.
     */
    public function __construct(Reference $reference)
    {
        $this->reference = $reference;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Attestation de Référence Validée')
            ->greeting('Bonne nouvelle !')
            ->line('Votre attestation de référence a été validée.')
            ->line('Projet : ' . $this->reference->project_name)
            ->line('Client : ' . $this->reference->client_name)
            ->action('Voir la référence', url('/fournisseurs-traitants/references'))
            ->line('Merci pour votre collaboration.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $data = [
            'titre' => '✅ Référence Validée',
            'commentaire' => "Votre référence du projet '{$this->reference->project_name}' a été validée par les RH.",
            'priority' => 'normal',
            'icon' => '✅',
            'document_id' => $this->reference->id,
            'document_type' => 'reference',
            'url' => '/fournisseurs-traitants/references',
            'action_required' => false,
            'project_name' => $this->reference->project_name,
            'client_name' => $this->reference->client_name,
            'validated_at' => $this->reference->validated_at->toDateTimeString(),
        ];

        if ($this->reference->validation_comment) {
            $data['validation_comment'] = $this->reference->validation_comment;
            $data['commentaire'] .= " Commentaire: {$this->reference->validation_comment}";
        }

        return $data;
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}