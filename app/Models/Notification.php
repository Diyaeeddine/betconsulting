<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'sender',
        'receiver',
        'message',
        'statut',
        'recorded_at',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];

}
