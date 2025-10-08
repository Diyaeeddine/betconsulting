<?php

namespace App\Notifications;

use App\Models\MethodologyDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MethodologyDocumentNotification extends Notification
{
    use Queueable;

    protected $document;
    protected $action;
    protected $comment;

    public function __construct(MethodologyDocument $document, string $action, ?string $comment = null)
    {
        $this->document = $document;
        $this->action = $action;
        $this->comment = $comment;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $data = [
            'document_id' => $this->document->id,
            'document_type' => 'methodology',
            'file_name' => $this->document->file_name,
            'type' => $this->document->type,
            'action' => $this->action,
            'action_required' => $this->action === 'submitted',
        ];

        switch ($this->action) {
            case 'submitted':
                $data['titre'] = '📄 Nouveau document à valider';
                $data['commentaire'] = "Un document {$this->getTypeLabel()} a été soumis pour validation";
                $data['priority'] = 'urgent';
                $data['icon'] = '📋';
                $data['url'] = '/ressources-humaines/MethodologyValidation';
                break;

            case 'validated':
                $data['titre'] = '✅ Document validé';
                $data['commentaire'] = "Votre document {$this->getTypeLabel()} a été validé par les RH";
                $data['priority'] = 'info';
                $data['icon'] = '✅';
                $data['url'] = '/fournisseurs-traitants/MethodologiePlanning';
                if ($this->comment) {
                    $data['validator_comment'] = $this->comment;
                }
                break;

            case 'rejected':
                $data['titre'] = '❌ Document rejeté';
                $data['commentaire'] = "Votre document {$this->getTypeLabel()} a été rejeté";
                $data['priority'] = 'critique';
                $data['icon'] = '❌';
                $data['url'] = '/fournisseurs-traitants/MethodologiePlanning';
                if ($this->comment) {
                    $data['validator_comment'] = $this->comment;
                }
                break;
        }

        return $data;
    }

    protected function getTypeLabel(): string
    {
        $labels = [
            'methodologie' => 'Méthodologie d\'Exécution',
            'planning' => 'Planning d\'Exécution',
            'chronogram' => 'Chronogramme',
            'organigramme' => 'Organigramme',
            'auto_control' => 'Auto-Contrôle',
        ];

        return $labels[$this->document->type] ?? $this->document->type;
    }
}