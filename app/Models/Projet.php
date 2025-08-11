<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Projet extends Model {
    use HasFactory;

    protected $fillable = [
        'nom', 'description', 'budget_total', 'budget_utilise',
        'date_debut', 'date_fin', 'statut', 'client',
        'lieu_realisation', 'responsable_id', 'type_projet'
    ];

    public function responsable() {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    public function depenses() {
        return $this->hasMany(Depense::class);
    }

    public function salaries() {
        return $this->hasMany(Salarie::class);
    }
}
