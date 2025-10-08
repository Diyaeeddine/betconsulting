<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\Notifiable;

class NotificationController extends Controller
{   
    use Notifiable; // ← This is correct

    public function index()
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }
        
        // Use Laravel's notification system
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                $data = $notification->data;
                
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $data,
                    'read_at' => $notification->read_at ? $notification->read_at->toISOString() : null,
                    'created_at' => $notification->created_at->toISOString(),
                    'is_read' => $notification->read_at !== null,
                    
                    // Extract data fields
                    'titre' => $data['titre'] ?? 'Notification',
                    'commentaire' => $data['commentaire'] ?? '',
                    'priority' => $data['priority'] ?? 'info',
                    'icon' => $data['icon'] ?? '📄',
                    'document_id' => $data['document_id'] ?? null,
                    'document_type' => $data['document_type'] ?? null,
                    'url' => $data['url'] ?? null,
                    'action_required' => $data['action_required'] ?? false,
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
                
                return [
                    'id' => $notification->id,
                    'titre' => $data['titre'] ?? 'Notification',
                    'commentaire' => $data['commentaire'] ?? null,
                    'created_at' => $notification->created_at->toISOString(),
                    'read_at' => null,
                    'priority' => $data['priority'] ?? 'info',
                    'icon' => $data['icon'] ?? '📄',
                    'url' => $data['url'] ?? null,
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $notifications->count()
        ]);
    }

    /**
     * Créer une notification manuelle (pour les tests)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'titre' => 'required|string|max:255',
            'commentaire' => 'nullable|string',
            'priority' => 'nullable|string|in:critique,urgent,normal,info',
            'type' => 'nullable|string',
            'action_required' => 'nullable|boolean',
        ]);

        $user = \App\Models\User::find($data['user_id']);
        
        // Utiliser le système de notifications Laravel
        $user->notify(new \App\Notifications\ManualNotification(
            $data['titre'],
            $data['commentaire'] ?? '',
            $data['priority'] ?? 'info',
            $data['type'] ?? 'general',
            $data['action_required'] ?? false
        ));

        return response()->json([
            'success' => true,
            'message' => 'Notification créée avec succès'
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
        
        $user->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications ont été marquées comme lues',
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
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Notification introuvable',
            ], 404);
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