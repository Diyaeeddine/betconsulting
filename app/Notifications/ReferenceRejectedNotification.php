<?php

namespace App\Notifications;

use App\Models\Reference;
use App\Events\NewNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReferenceRejectedNotification extends Notification implements ShouldQueue
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
        $mail = (new MailMessage)
            ->subject('Attestation de Référence Rejetée')
            ->greeting('Information importante')
            ->line('Votre attestation de référence a été rejetée.')
            ->line('Projet : ' . $this->reference->project_name)
            ->line('Client : ' . $this->reference->client_name);

        if ($this->reference->validation_comment) {
            $mail->line('Raison du rejet : ' . $this->reference->validation_comment);
        }

        $mail->action('Voir la référence', url('/fournisseurs-traitants/references'))
            ->line('Vous pouvez soumettre une nouvelle attestation corrigée.');

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $commentaire = "Votre référence du projet '{$this->reference->project_name}' a été rejetée par les RH.";
        
        if ($this->reference->validation_comment) {
            $commentaire .= " Raison: {$this->reference->validation_comment}";
        }

        return [
            'titre' => '❌ Référence Rejetée',
            'commentaire' => $commentaire,
            'priority' => 'high',
            'icon' => '❌',
            'document_id' => $this->reference->id,
            'document_type' => 'reference',
            'url' => '/fournisseurs-traitants/references',
            'action_required' => true,
            'project_name' => $this->reference->project_name,
            'client_name' => $this->reference->client_name,
            'validation_comment' => $this->reference->validation_comment,
            'rejected_at' => $this->reference->validated_at->toDateTimeString(),
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}