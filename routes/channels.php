<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, $id) {
    // Autorise seulement si l'utilisateur connecté est celui du canal
    return (int) $user->id === (int) $id;
});
