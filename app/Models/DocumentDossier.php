<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentDossier extends Model
{
    protected $table = 'documents_dossier';
    
    protected $fillable = [
        'dossier_marche_id',
        'document_id',
        'tache_dossier_id',
        'type_attachment',
        'nom_fichier',
        'nom_original',
        'chemin_fichier',
        'type_mime',
        'taille_fichier',
        'uploaded_by',
        'date_upload',
        'description',
        'est_valide_au_moment_usage',
        'date_expiration_au_moment_usage'
    ];

    protected $casts = [
        'date_upload' => 'datetime',
        'date_expiration_au_moment_usage' => 'datetime',
        'est_valide_au_moment_usage' => 'boolean',
        'taille_fichier' => 'integer'
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(DossierMarche::class, 'dossier_marche_id');
    }

    public function documentPermanent(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'document_id');
    }

    public function tache(): BelongsTo
    {
        return $this->belongsTo(TacheDossier::class, 'tache_dossier_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}