<?php

use Illuminate\Support\Facades\Broadcast;

use App\Models\Salarie;

Broadcast::channel('salarie.{salarieId}', function ($user, $salarieId) {
    $salarie = Salarie::find($salarieId);

    // Only salaries with emplacement = "terrain" can connect
    if ($salarie && $salarie->emplacement === 'terrain') {
        return (int) $user->id === (int) $salarieId;
    }

    return false;
});
