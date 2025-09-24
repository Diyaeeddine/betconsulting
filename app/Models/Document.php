<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'nom', 'type', 'file_path', 'file_type', 'statut', 'uploaded_by', 'projet_id'
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}