<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Mapping des types de classes vers les types frontend
     */
    private function getNotificationType($classType)
    {
        $typeMapping = [
            'App\Notifications\DocumentExpirationNotification' => 'document_expiration',
            // 'App\Notifications\MarcheDecisionNotification' => 'marche_decision',
            'App\Notifications\MarcheValidationAdminNotification' => 'marche_validation_admin',
            'App\Notifications\TachePreparationNotification' => 'tache_preparation',
            'App\Notifications\ValidationProfileNotification' => 'validation_profile_salarie',
        ];

        return $typeMapping[$classType] ?? 'general';
    }

    /**
     * Récupère toutes les notifications de l'utilisateur connecté
     */
    public function index()
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }
        
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                $data = $notification->data;
                
                // Utiliser le type depuis data si disponible, sinon mapper depuis la classe
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
                    'periodicite' => $data['periodicite'] ?? null,
                    
                    // Marchés
                    'marche_id' => $data['marche_id'] ?? null,
                    'reference' => $data['reference'] ?? null,
                    'objet' => $data['objet'] ?? null,
                    'type_ao' => $data['type_ao'] ?? null,
                    'estimation' => $data['estimation'] ?? null,
                    'decision' => $data['decision'] ?? null,
                    'date_decision' => $data['date_decision'] ?? null,
                    'date_limite' => $data['date_limite'] ?? null,
                    'service_origine' => $data['service_origine'] ?? null,
                    'date' => $data['date'] ?? null,
                    
                    // Tâches
                    'taches' => $data['taches'] ?? null,
                    'nombre_taches' => $data['nombre_taches'] ?? null,
                    'projet' => $data['projet'] ?? null,
                    'date_echeance' => $data['date_echeance'] ?? null,
                    'days_until_deadline' => $data['days_until_deadline'] ?? null,
                    
                    // Salariés
                    'salarie_id' => $data['salarie_id'] ?? null,
                    'salarie_nom' => $data['salarie_nom'] ?? null,
                    'salarie_prenom' => $data['salarie_prenom'] ?? null,
                    'salarie_matricule' => $data['salarie_matricule'] ?? null,
                ];
            });

        return response()->json($notifications);
    }

    /**
     * Récupère uniquement les notifications non lues
     */
    public function getUnread(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }
        
        $notifications = $user->unreadNotifications()
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
                    'document_type' => $data['document_type'] ?? null,
                    'days_until_expiration' => $data['days_until_expiration'] ?? null,
                    'date_expiration' => $data['date_expiration'] ?? null,
                    'action_required' => $data['action_required'] ?? false,
                    'marche_id' => $data['marche_id'] ?? null,
                    'reference' => $data['reference'] ?? null,
                    'objet' => $data['objet'] ?? null,
                    'type_ao' => $data['type_ao'] ?? null,
                    'estimation' => $data['estimation'] ?? null,
                    'decision' => $data['decision'] ?? null,
                    'document_id' => $data['document_id'] ?? null,
                    'salarie_id' => $data['salarie_id'] ?? null,
                    'salarie_nom' => $data['salarie_nom'] ?? null,
                    'salarie_prenom' => $data['salarie_prenom'] ?? null,
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
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }
        
        $notification = $user->notifications()->find($id);
        
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
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }
        
        $updatedCount = $user->unreadNotifications()->update(['read_at' => now()]);

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
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }
        
        try {
            $notification = $user->notifications()->findOrFail($id);
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
            \Log::error('Erreur lors de la suppression de notification: ' . $e->getMessage(), [
                'user_id' => $user->id,
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
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $count = $user->unreadNotifications()->count();

        return response()->json([
            'unread_count' => $count
        ]);
    }

    /**
     * Debug - Obtenir les informations détaillées d'une notification
     */
    public function debug($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        try {
            $notification = $user->notifications()->findOrFail($id);
            
            return response()->json([
                'notification' => [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'type_mapped' => $this->getNotificationType($notification->type),
                    'data' => $notification->data,
                    'notifiable_type' => $notification->notifiable_type,
                    'notifiable_id' => $notification->notifiable_id,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    'updated_at' => $notification->updated_at,
                ],
                'user_id' => $user->id,
                'total_notifications' => $user->notifications()->count(),
                'unread_notifications' => $user->unreadNotifications()->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Notification non trouvée',
                'message' => $e->getMessage(),
                'user_id' => $user->id,
                'searched_id' => $id,
            ], 404);
        }
    }

    /**
     * Marquer plusieurs notifications comme lues
     */
    public function markMultipleAsRead(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $data = $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'string|exists:notifications,id'
        ]);

        $updatedCount = $user->notifications()
            ->whereIn('id', $data['notification_ids'])
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => "{$updatedCount} notifications marquées comme lues",
            'updated_count' => $updatedCount
        ]);
    }
}