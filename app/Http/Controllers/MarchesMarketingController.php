<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Document;
use App\Models\MarchePublic;
use App\Models\Salarie;
use Inertia\Response;
use App\Models\DossierMarche;
use App\Models\TacheDossier;
use App\Models\ParticipationMarche;
use App\Models\HistoriqueMarche;
use App\Models\DocumentDossier;
use App\Models\AffectationTache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class MarchesMarketingController extends Controller
{
    public function index()
    {
        return Inertia::render('marches-marketing/Dashboard');
    }

public function users()
{          
    $salaries = Salarie::where('is_accepted', true)
        ->where('nom_profil', 'marche_marketing')
        ->select([
            'id', 'nom', 'prenom', 'email', 'telephone', 
            'poste', 'nom_profil', 'salaire_mensuel', 
            'date_embauche', 'statut', 'projet_ids', 'created_at'
        ])
        ->get();          

    $marches = MarchePublic::select([
        'id', 'reference', 'objet', 'maitre_ouvrage', 
        'statut', 'type_marche', 'urgence', 
        'date_limite_soumission', 'montant', 'ville'
    ])  
    ->where('is_accepted',true)
    ->where('etape','preparation')
    ->orderBy('date_limite_soumission', 'asc')
    ->get();

    return Inertia::render('marches-marketing/Users', [
        'salaries' => $salaries,
        'marches' => $marches,
    ]);      
}
    
}