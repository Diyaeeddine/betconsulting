<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('salarie.{id}', function ($salarie, $id) {
    if (!auth('salarie')->check()) {
        return false;
    }
    
    return (int) $salarie->id === (int) $id;
});