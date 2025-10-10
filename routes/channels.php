<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Salarie;

Broadcast::channel('salarie.{salarieId}', function ($user, $salarieId) {
    // Check if the authenticated user has a related salarie with this ID
    return $user->salarie && 
           (int) $user->salarie->id === (int) $salarieId &&
           $user->salarie->emplacement === 'terrain';
});


Broadcast::channel('user.{id}', function ($user, $id) {
    // Autorise seulement si l'utilisateur connecté est celui du canal
    return (int) $user->id === (int) $id;
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal global pour les études techniques (optionnel)
Broadcast::channel('etudes-techniques-global', function ($user) {
    return $user->hasRole('etudes-techniques');
});


// You can add more channels here as needed
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});


Broadcast::channel('salarie.{id}', function ($salarie, $id) {
    if (!auth('salarie')->check()) {
        return false;
    }
    
    return (int) $salarie->id === (int) $id;
});


