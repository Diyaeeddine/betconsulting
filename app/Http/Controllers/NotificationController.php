<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Récupère toutes les notifications de l'utilisateur connecté
     */
    public function index()
    {
        $user = auth()->user();
        
        // Utiliser le système de notifications Laravel
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data, // Contient titre, commentaire, etc.
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    // Extraire les données depuis le champ 'data'
                    'titre' => $notification->data['titre'] ?? 'Notification',
                    'commentaire' => $notification->data['commentaire'] ?? '',
                    'is_read' => $notification->read_at !== null,
                ];
            });

        return response()->json($notifications);
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
        ]);

        $user = \App\Models\User::find($data['user_id']);
        
        // Utiliser le système de notifications Laravel
        $user->notify(new \App\Notifications\ManualNotification(
            $data['titre'],
            $data['commentaire'] ?? ''
        ));

        return response()->json(['status' => 'Message and notification sent!']);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead($id)
    {
        $user = auth()->user();
        
        // Utiliser le système de notifications Laravel
        $notification = $user->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead()
    {
        $user = auth()->user();
        $user->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Supprimer une notification
     */
    public function destroy($id)
    {
        $user = auth()->user();
        
        $notification = $user->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return response()->json(['success' => true]);
    }
}