<?php

// ============================================================================
// FILE 1: app/Notifications/NewReferenceSubmittedNotification.php
// Sent to RH when supplier submits a reference
// ============================================================================

namespace App\Notifications;

use App\Models\Reference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewReferenceSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $reference;

    public function __construct(Reference $reference)
    {
        $this->reference = $reference;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle Attestation de Référence à Valider')
            ->greeting('Nouvelle référence soumise')
            ->line('Une nouvelle attestation de référence a été soumise et nécessite votre validation.')
            ->line('Fournisseur : ' . $this->reference->user->name)
            ->line('Projet : ' . $this->reference->project_name)
            ->line('Client : ' . $this->reference->client_name)
            ->action('Valider la référence', url('/ressources-humaines/references'))
            ->line('Merci de traiter cette demande dans les plus brefs délais.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'titre' => '📄 Nouvelle Référence à Valider',
            'commentaire' => "Le fournisseur {$this->reference->user->name} a soumis une nouvelle attestation de référence pour le projet '{$this->reference->project_name}'.",
            'priority' => 'high',
            'icon' => '📄',
            'document_id' => $this->reference->id,
            'document_type' => 'reference',
            'url' => '/ressources-humaines/references',
            'action_required' => true,
            'supplier_name' => $this->reference->user->name,
            'supplier_email' => $this->reference->user->email,
            'project_name' => $this->reference->project_name,
            'client_name' => $this->reference->client_name,
            'submitted_at' => $this->reference->submitted_at->toDateTimeString(),
        ];
    }

    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}

// ============================================================================
// FILE 2: app/Notifications/ReferenceValidatedNotification.php
// Sent to supplier when RH validates their reference
// ============================================================================

namespace App\Notifications;

use App\Models\Reference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReferenceValidatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $reference;

    public function __construct(Reference $reference)
    {
        $this->reference = $reference;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Attestation de Référence Validée')
            ->greeting('Bonne nouvelle !')
            ->line('Votre attestation de référence a été validée.')
            ->line('Projet : ' . $this->reference->project_name)
            ->line('Client : ' . $this->reference->client_name);

        if ($this->reference->validation_comment) {
            $mail->line('Commentaire : ' . $this->reference->validation_comment);
        }

        $mail->action('Voir la référence', url('/fournisseurs-traitants/references'))
            ->line('Merci pour votre collaboration.');

        return $mail;
    }

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

    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}

// ============================================================================
// FILE 3: app/Notifications/ReferenceRejectedNotification.php
// Sent to supplier when RH rejects their reference
// ============================================================================

namespace App\Notifications;

use App\Models\Reference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReferenceRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $reference;

    public function __construct(Reference $reference)
    {
        $this->reference = $reference;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

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

    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}