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
            'reference'           => 'AO-2025-001',
            'maitre_ouvrage'      => 'Commune de Casablanca',
            'pv'                  => null,
            'caution_provisoire'  => 7000,
            'date_ouverture'      => '2025-11-10',
            'date_limite_soumission' => '2025-11-15 10:00:00',
            'date_publication'    => '2025-10-01 09:00:00',
            'statut'              => 'detecte',
            'type_marche'         => 'etudes',
            'budget'              => '350000',
            'urgence'             => 'moyenne',
            'zone_geographique'   => 'Casablanca',
            'ville'               => 'Casablanca',
            'objet'               => 'Étude de faisabilité pour un complexe sportif',
            'importance'          => 'ao_ouvert',
            'etat'                => 'en cours',
            'is_accepted'         => false,
            'etape'               => 'préparation',
        ]);

        MarchePublic::create([
            'reference'           => 'AO-2025-002',
            'maitre_ouvrage'      => 'Hôpital Régional de Fès',
            'caution_provisoire'  => 15000,
            'date_ouverture'      => '2025-12-05',
            'date_limite_soumission' => '2025-12-08 14:30:00',
            'date_publication'    => '2025-10-15 09:00:00',
            'statut'              => 'evalue',
            'type_marche'         => 'assistance_technique',
            'budget'              => '890000',
            'urgence'             => 'elevee',
            'zone_geographique'   => 'Fès',
            'ville'               => 'Fès',
            'objet'               => 'Fourniture d’équipements médicaux',
            'importance'          => 'ao_important',
            'etat'                => null,
            'is_accepted'         => false,
            'etape'               => null,
        ]);

        MarchePublic::create([
            'reference'           => 'AO-2025-003',
            'maitre_ouvrage'      => 'Office National de l’Eau Potable',
            'caution_provisoire'  => 50000,
            'date_ouverture'      => '2025-11-20',
            'date_limite_soumission' => '2025-11-25 11:00:00',
            'date_publication'    => '2025-10-10 09:00:00',
            'statut'              => 'en_preparation',
            'type_marche'         => 'hydraulique',
            'budget'              => '2500000',
            'urgence'             => 'faible',
            'zone_geographique'   => 'Tanger',
            'ville'               => 'Tanger',
            'objet'               => 'Extension du réseau d’assainissement',
            'importance'          => 'ao_simplifie',
            'etat'                => 'planifié',
            'is_accepted'         => false,
            'etape'               => 'soumission',
        ]);

        MarchePublic::create([
            'reference'           => 'AO-2025-004',
            'maitre_ouvrage'      => 'Université Mohammed V - Rabat',
            'caution_provisoire'  => 9000,
            'date_ouverture'      => '2025-10-25',
            'date_limite_soumission' => '2025-10-30 09:00:00',
            'date_publication'    => '2025-09-28 09:00:00',
            'statut'              => 'soumis',
            'type_marche'         => 'assistance_technique',
            'budget'              => '450000',
            'urgence'             => 'moyenne',
            'zone_geographique'   => 'Rabat',
            'ville'               => 'Rabat',
            'objet'               => 'Maintenance informatique et réseau',
            'importance'          => 'ao_restreint',
            'etat'                => null,
            'is_accepted'         => false,
            'etape'               => 'analyse',
        ]);

        MarchePublic::create([
            'reference'           => 'AO-2025-005',
            'maitre_ouvrage'      => 'Agence Urbaine de Meknès',
            'caution_provisoire'  => 3600,
            'date_ouverture'      => '2025-12-15',
            'date_limite_soumission' => '2025-12-20 15:00:00',
            'date_publication'    => '2025-11-01 09:00:00',
            'statut'              => 'detecte',
            'type_marche'         => 'etudes',
            'budget'              => '180000',
            'urgence'             => 'elevee',
            'zone_geographique'   => 'Meknès',
            'ville'               => 'Meknès',
            'objet'               => 'Étude d’impact environnemental',
            'importance'          => 'ao_preselection',
            'etat'                => null,
            'is_accepted'         => false,
            'etape'               => null,
        ]);
    }
}
