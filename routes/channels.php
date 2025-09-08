<?php

use Illuminate\Support\Facades\Broadcast;

use App\Models\Salarie;

Broadcast::channel('salarie.{salarieId}', function ($user, $salarieId) {
    return $user instanceof \App\Models\Salarie
        && $user->emplacement === 'terrain'
        && (int) $user->id === (int) $salarieId;
});
