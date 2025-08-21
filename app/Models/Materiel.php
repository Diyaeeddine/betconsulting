<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materiel extends Model {
    use HasFactory;

    protected $fillable = [
        'nom',
        'marque',              
        'type',
        'etat',
        'cout_location_jour',
        'date_acquisition',
        'duree_location',
        'salarie_id',
        'statut',              
        'type_paiement',      
        'montant_achat',       
        'montant_credit_total', 
        'montant_credit_mensuel',
        'duree_credit_mois',
        'date_debut_credit',
        'date_debut_location',
        'date_fin_location',
        'cout_location',       
    ];

    protected $dates = [
        'date_acquisition',
        'date_debut_location',
        'date_fin_location',
        'date_debut_credit',
    ];

    public function salarie() {
        return $this->belongsTo(Salarie::class);
    }
}
