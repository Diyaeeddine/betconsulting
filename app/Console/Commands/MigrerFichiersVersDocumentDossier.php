<?php
// app/Console/Commands/MigrerFichiersVersDocumentDossier.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DossierMarche;
use App\Models\TacheDossier;
use App\Models\DocumentDossier;

class MigrerFichiersVersDocumentDossier extends Command
{
    protected $signature = 'marches:migrate-fichiers';
    protected $description = 'Migrer les fichiers JSON vers documents_dossier';

    public function handle()
    {
        $this->info('Migration des fichiers des dossiers...');
        
        $dossiers = DossierMarche::whereNotNull('fichiers_joints')->get();
        
        foreach ($dossiers as $dossier) {
            $fichiers = json_decode($dossier->fichiers_joints, true) ?? [];
            
            foreach ($fichiers as $fichier) {
                DocumentDossier::create([
                    'dossier_marche_id' => $dossier->id,
                    'type_attachment' => 'fichier_specifique',
                    'nom_fichier' => $fichier['nom_fichier'] ?? 'unknown',
                    'nom_original' => $fichier['nom_original'] ?? 'unknown',
                    'chemin_fichier' => $fichier['chemin'] ?? '',
                    'type_mime' => $fichier['type'] ?? null,
                    'taille_fichier' => $fichier['taille'] ?? null,
                    'uploaded_by' => $fichier['uploaded_by'] ?? 1,
                    'date_upload' => $fichier['date_upload'] ?? now()
                ]);
            }
            
            $this->info("Dossier {$dossier->id}: " . count($fichiers) . " fichiers migrés");
        }
        
        $this->info('Migration terminée!');
    }
}