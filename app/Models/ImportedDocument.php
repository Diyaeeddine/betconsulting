<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportedDocument extends Model
{
    use HasFactory;

    protected $table = 'imported_documents';

    protected $fillable = [
        'projet_mp_id',    // lien avec ProjetMp
        'label',           // nom du label (ex: "Documents techniques")
        'files',           // liste des fichiers (JSON)
    ];

    protected $casts = [
        'files' => 'array', // les fichiers seront stockés en JSON
    ];

    /**
     * Relation : un document importé appartient à un projet MP.
     */
    public function projetMp()
    {
        return $this->belongsTo(ProjetMp::class);
    }
}
