<?php

use Illuminate\Support\Facades\Broadcast;

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
