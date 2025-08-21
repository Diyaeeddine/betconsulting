<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'source_user_id',
        'titre',
        'commentaire',
        'type',
        'is_read',
        'done',
        'read_at'
    ];
}