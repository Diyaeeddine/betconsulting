<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WsTechPosition extends Model
{
    use HasFactory;

    protected $table = 'ws_tech_positions';

    protected $fillable = [
        'salarie_id',
        'lat',
        'long',
        'alt',
        'recorded_at',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];

    public function salarie()
    {
        return $this->belongsTo(Salarie::class);
    }
}
