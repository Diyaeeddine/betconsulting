<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProfilsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('profils')->insert([
            [
                'salarie_id' => 1, // Make sure this salarie exists
                'categorie_profil' => 'profils_techniques_fondamentaux',
                'poste_profil' => 'ingenieur_structure_beton_arme',
                'niveau_experience' => 'junior',
                'competences_techniques' => json_encode([
                    'AutoCAD', 'Robot Structural Analysis', 'Eurocode'
                ]),
                'certifications' => json_encode([
                    'Eurocode Certified', 'BIM Level 2'
                ]),
                'missions' => 'Participer aux études et au dimensionnement des structures béton armé.',
                'actif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'salarie_id' => 2,
                'categorie_profil' => 'profils_management_encadrement',
                'poste_profil' => 'chef_projet_etudes',
                'niveau_experience' => 'senior',
                'competences_techniques' => json_encode([
                    'Gestion de projet', 'Planification', 'Revit'
                ]),
                'certifications' => json_encode([
                    'PMP', 'Lean Construction'
                ]),
                'missions' => 'Superviser les équipes techniques et gérer le planning des études.',
                'actif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'salarie_id' => 3,
                'categorie_profil' => 'profils_digital_innovation',
                'poste_profil' => 'bim_manager',
                'niveau_experience' => 'expert',
                'competences_techniques' => json_encode([
                    'Revit', 'Navisworks', 'Dynamo', 'BIM 360'
                ]),
                'certifications' => json_encode([
                    'BIM Level 3', 'ISO 19650'
                ]),
                'missions' => 'Mettre en place et gérer les standards BIM sur les projets.',
                'actif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
