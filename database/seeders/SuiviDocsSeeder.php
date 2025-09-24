<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DocsRequis;

class SuiviDocsSeeder extends Seeder
{
    public function run(): void
    {
        $docs = [
            // Documents d'entrée requis
            ['nom' => "Marché signé", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Bordereau des prix", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "CPS", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "OS", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Dossier marché", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Planning prévisionnel", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Plans de l'entreprise", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "PPES", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "PAQ", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Plans d'exécution (BA, GC, réseaux)", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Notes de calcul", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Fiches techniques", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "PV de contrôle", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Certificats de conformité", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Plans validés", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Piquetage", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Profils", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Avancement réel", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Méthode de construction", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Métrés", 'description' => "Requis", 'type' => 'entry'],
            ['nom' => "Plans modifiés", 'description' => "Requis", 'type' => 'entry'],

            // Livrables à produire
            ['nom' => "Notification officielle de démarrage", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "PV de réunion", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Compte rendu", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Outils de suivi", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Visa ou remarques à corriger", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Rapport de conformité", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Validation ou remarques", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Validation du matériel", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Demande de changement", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "PV d'implantation", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Fiches de visite", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Remarques", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Instructions", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Attachements signés", 'description' => "Livrable", 'type' => 'livrable'],
            ['nom' => "Décomptes mensuels", 'description' => "Livrable", 'type' => 'livrable'],
        ];

        foreach ($docs as $doc) {
            DocsRequis::create($doc);
        }
    }
}
