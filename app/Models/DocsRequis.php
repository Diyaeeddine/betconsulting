<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocsRequis extends Model
{
    protected $table = 'docs_requis';

    protected $fillable = [
        'nom', 'description', 'type'
    ];
}