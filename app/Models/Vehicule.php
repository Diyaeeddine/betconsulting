<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicule extends Model {
    use HasFactory;

    protected $fillable = [
        'modele',
        'matricule',
        'marque',
        'type',
        'etat',
        'carburant',
        'cout_location_jour',
        'date_affectation',
        'date_disponibilite',
        'duree_affectation',
        'salarie_id',
        'duree_location',
        'statut',
        'date_achat',
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
        'date_affectation',
        'date_disponibilite',
        'date_achat',
        'date_debut_location',
        'date_fin_location',
        'date_debut_credit',
    ];

    public function salarie() {
        return $this->belongsTo(Salarie::class);
    }
}
