<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProjetMssg extends Model
{
    use HasFactory;

    protected $table = 'projet_mssgs';

    protected $fillable = [
        'mssg',
        'sent_by',
        'projet_id',
    ];

    // Relations
    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

 
}
