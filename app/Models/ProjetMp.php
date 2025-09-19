<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjetMp extends Model
{
    use HasFactory;

    protected $table = 'projet_mps';

    protected $fillable = [
        'type_procedure',
        'detail_procedure',
        'categorie',
        'date_publication',
        'reference',
        'objet',
        'objet_complet',
        'acheteur_public',
        'lieu_execution',
        'lieu_execution_complet',
        'lien_detail_lots',
        'date_limite',
        'type_reponse_electronique',
        'lien_consultation',
        'ref_consultation_id',
        'extracted_at',
        'row_index',
        'storage_link_csv',
        'storage_link_json',
        'EXTRACTED_FILES',
        'chemin_zip',
    ];

    protected $casts = [
        'EXTRACTED_FILES' => 'array',   // stocker sous forme de tableau JSON
        'extracted_at' => 'datetime',   // conversion auto en Carbon
        'date_publication' => 'date',
        'date_limite' => 'datetime',
    ];
}
