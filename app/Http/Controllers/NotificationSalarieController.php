<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationSalarieController extends Controller
{
    /**
     * Mapping des types de classes vers les types frontend
     */
    private function getNotificationType($classType)
    {
        $typeMapping = [
            'App\Notifications\Salarie\DocumentExpirationNotification' => 'document_expiration',
            'App\Notifications\Salarie\TacheAssigneeNotification' => 'tache_assignee',
            'App\Notifications\Salarie\ValidationProfileNotification' => 'validation_profile',
            'App\Notifications\Salarie\CongeDecisionNotification' => 'conge_decision',
            // Ajoutez d'autres types selon vos besoins
        ];

        return $typeMapping[$classType] ?? 'general';
    }

    /**
     * Récupère toutes les notifications du salarié connecté
     */
    public function index()
    {
        $salarie = auth('salarie')->user();
        
        if (!$salarie) {
            return response()->json(['error' => 'Salarié non authentifié'], 401);
        }
        
        $notifications = $salarie->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                $data = $notification->data;
                $type = $data['type'] ?? $this->getNotificationType($notification->type);
                
                return [
                    'id' => $notification->id,
                    'type' => $type, 
                    'titre' => $data['titre'] ?? 'Notification',
                    'commentaire' => $data['commentaire'] ?? '',
                    'created_at' => $notification->created_at->toISOString(),
                    'read_at' => $notification->read_at ? $notification->read_at->toISOString() : null,
                    
                    // Métadonnées
                    'priority' => $data['priority'] ?? 'info',
                    'action_required' => $data['action_required'] ?? false,
                    
                    // Documents
                    'document_id' => $data['document_id'] ?? null,
                    'document_type' => $data['document_type'] ?? null,
                    'days_until_expiration' => $data['days_until_expiration'] ?? null,
                    'date_expiration' => $data['date_expiration'] ?? null,
                    
                    // Tâches
                    'tache_id' => $data['tache_id'] ?? null,
                    'tache_titre' => $data['tache_titre'] ?? null,
                    'projet' => $data['projet'] ?? null,
                    'date_echeance' => $data['date_echeance'] ?? null,
                    'days_until_deadline' => $data['days_until_deadline'] ?? null,
                    
                    // Congés
                    'conge_id' => $data['conge_id'] ?? null,
                    'type_conge' => $data['type_conge'] ?? null,
                    'date_debut' => $data['date_debut'] ?? null,
                    'date_fin' => $data['date_fin'] ?? null,
                    'decision' => $data['decision'] ?? null,
                    'motif_refus' => $data['motif_refus'] ?? null,
                    
                    // Profil
                    'validation_status' => $data['validation_status'] ?? null,
                    'validation_message' => $data['validation_message'] ?? null,
                ];
            });

        return response()->json($notifications);
    }

    /**
     * Récupère uniquement les notifications non lues
     */
    public function getUnread(Request $request)
    {
        $salarie = auth('salarie')->user();
        
        if (!$salarie) {
            return response()->json(['error' => 'Salarié non authentifié'], 401);
        }
        
        $notifications = $salarie->unreadNotifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                $data = $notification->data;
                $type = $data['type'] ?? $this->getNotificationType($notification->type);
                
                return [
                    'id' => $notification->id,
                    'type' => $type,
                    'titre' => $data['titre'] ?? 'Notification',
                    'commentaire' => $data['commentaire'] ?? null,
                    'created_at' => $notification->created_at->toISOString(),
                    'read_at' => null,
                    'priority' => $data['priority'] ?? 'info',
                    'action_required' => $data['action_required'] ?? false,
                    // Autres champs selon vos besoins
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $notifications->count()
        ]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead(Request $request, $id)
    {
        $salarie = auth('salarie')->user();
        
        if (!$salarie) {
            return response()->json(['error' => 'Salarié non authentifié'], 401);
        }
        
        $notification = $salarie->notifications()->find($id);
        
        if (!$notification) {
            return response()->json(['error' => 'Notification introuvable'], 404);
        }

        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue',
            'notification' => [
                'id' => $notification->id,
                'read_at' => $notification->read_at->toISOString(),
            ]
        ]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request)
    {
        $salarie = auth('salarie')->user();
        
        if (!$salarie) {
            return response()->json(['error' => 'Salarié non authentifié'], 401);
        }
        
        $updatedCount = $salarie->unreadNotifications()->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications ont été marquées comme lues',
            'updated_count' => $updatedCount
        ]);
    }

    /**
     * Supprimer une notification
     */
    public function destroy($id)
    {
        $salarie = auth('salarie')->user();
        
        if (!$salarie) {
            return response()->json(['error' => 'Salarié non authentifié'], 401);
        }
        
        try {
            $notification = $salarie->notifications()->findOrFail($id);
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification supprimée avec succès',
                'deleted_id' => $id
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Notification introuvable',
                'message' => 'La notification avec l\'ID spécifié n\'existe pas ou ne vous appartient pas'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la suppression de notification salarié: ' . $e->getMessage(), [
                'salarie_id' => $salarie->id,
                'notification_id' => $id
            ]);
            
            return response()->json([
                'error' => 'Erreur interne',
                'message' => 'Impossible de supprimer la notification'
            ], 500);
        }
    }

    /**
     * Obtenir le nombre de notifications non lues
     */
    public function getUnreadCount()
    {
        $salarie = auth('salarie')->user();
        
        if (!$salarie) {
            return response()->json(['error' => 'Salarié non authentifié'], 401);
        }

        $count = $salarie->unreadNotifications()->count();

        return response()->json([
            'unread_count' => $count
        ]);
    }
}