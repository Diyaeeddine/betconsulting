<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicule extends Model {
    use HasFactory;

    protected $fillable = [
        'modele', 'matricule', 'marque', 'type', 'etat',
        'cout_location_jour', 'date_affectation', 'date_disponibilite',
        'duree_affectation', 'salarie_id', 'duree_location'
    ];

    public function salarie() {
        return $this->belongsTo(Salarie::class);
    }
    
}
