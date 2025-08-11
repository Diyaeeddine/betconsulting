<?php
// app/Models/Materiel.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materiel extends Model {
    use HasFactory;

    protected $fillable = [
        'nom', 'type', 'etat', 'cout_location_jour',
        'date_acquisition', 'duree_location', 'salarie_id'
    ];

    public function salarie() {
        return $this->belongsTo(Salarie::class);
    }
}
