<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MarchePublic;

class MarchePublicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        MarchePublic::create([
            'type_ao'              => 'Etudes',
            'n_reference'          => '04/2025',
            'etat'                 => 'en cours',
            'is_accepted'          => true,
            'etape'                => 'decision initial',
            'date_limite'          => '2025-08-19',
            'heure'                => '11:00:00',
            'mo'                   => 'Region de souss-massa / Commune de IMSOUANE',
            'objet'                => 'étude d’aménagement des pistes communales a la commune d’imsouane sur une longueur de 28 km',
            'estimation'           => 504000,
            'caution'              => 10080,
            'attestation_reference'=> 'OUI',
            'cnss'                 => 'OUI',
            'agrement'             => null,
            'equipe_demandee'      => "ing hydraulique-exp 15 ans\ning GC/GR/hydraulique-exp 10 ans\ntech GC-exp 15 ans",
            'contrainte'           => null,
            'autres'               => 'HISTORIQUE CNSS 6 MOIS',
            'mode_attribution'     => '70% Nt + 30% Nf',
            'lieu_ao'              => 'https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseDetailsConsultation&refConsultation=914407&orgAcronyme=f9f',
            'ville'                => 'Agadir',
            'lots'                 => null,
            'decision'             => null,
            'date_decision'        => null,
            'ordre_preparation'    => null,
        ]);

        MarchePublic::create([
            'type_ao'              => 'Travaux',
            'n_reference'          => '07/2025',
            'etat'                 => 'en cours',        
            'is_accepted'          => true,            
            'etape'                => 'decision admin',  
            'date_limite'          => '2025-10-05',
            'heure'                => '09:30:00',
            'mo'                   => 'Ministère de l’Équipement et de l’Eau',
            'objet'                => 'Travaux de réhabilitation et renforcement des routes régionales',
            'estimation'           => 1200000,
            'caution'              => 24000,
            'attestation_reference'=> 'OUI',
            'cnss'                 => 'OUI',
            'agrement'             => 'Catégorie 2',
            'equipe_demandee'      => "Ingénieur génie civil - exp 12 ans\nChef de chantier - exp 8 ans\nTechnicien topographe - exp 5 ans",
            'contrainte'           => 'Travaux doivent être réalisés en période estivale uniquement',
            'autres'               => 'Plan d’hygiène et sécurité obligatoire',
            'mode_attribution'     => '60% technique + 40% financier',
            'lieu_ao'              => 'https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseDetailsConsultation&refConsultation=999888&orgAcronyme=xyz',
            'ville'                => 'Marrakech',
            'lots'                 => 'Lot 1: 10 km - Lot 2: 15 km',
            'decision'             => 'Validé',
            'date_decision'        => '2025-10-20',
            'ordre_preparation'    => 'ORD-002/2025',
        ]);
    }
}
