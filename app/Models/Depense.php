<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Depense extends Model {
    use HasFactory;

    protected $fillable = ['projet_id', 'type', 'user_id', 'item', 'statut'];

    protected $casts = [
        'item' => 'array',
    ];

    public function projet() {
        return $this->belongsTo(Projet::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
