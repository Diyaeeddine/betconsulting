<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Notification;
use App\Events\NewNotification;

class NotificationController extends Controller
{


    
public function index()
{
    $user = auth()->user();
    return Notification::where('user_id', (int)$user->id)
        ->orderBy('created_at', 'desc')
        ->get();
}



public function store(Request $request)
{
    $data = $request->all();

    // soit tu valides en même temps (fortement recommandé)
    $data = $request->validate([
        'user_id' => 'required|exists:users,id',
        'titre' => 'required|string|max:255',
        'commentaire' => 'nullable|string',
    ]);

    $notification = Notification::create([
        'user_id' => $data['user_id'],
        'source_user_id' => null,
        'titre' => $data['titre'],
        'commentaire' => $data['commentaire'] ?? null,
        'type' => 'manual_test',
    ]);

    event(new NewNotification($notification));

    return response()->json(['status' => 'Message and notification sent!']);
}


    public function markAsRead($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $notification->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return response()->json(['success' => true]);
    }
}
