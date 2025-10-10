<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration 3 : historiques_marche
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('historiques_marche', function (Blueprint $table) {
            $table->id();

            // Références
            $table->foreignId('marche_id')
                  ->constrained('marche_public')
                  ->cascadeOnDelete();

            $table->foreignId('dossier_id')
                  ->nullable()
                  ->constrained('dossiers_marche')
                  ->nullOnDelete();

            $table->foreignId('tache_id')
                  ->nullable()
                  ->constrained('taches_dossier')
                  ->nullOnDelete();

            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Type d’événement
            $table->enum('type_evenement', [
                'creation_marche',
                'selection_marche',
                'acceptation_marche',
                'rejet_marche',
                'annulation_marche',
                'changement_etape',
                'changement_etat',
                'validation_dg',
                'demande_modification_dg',
                'refus_dg',
                'approbation_finale',
                'creation_dossier',
                'modification_dossier',
                'validation_dossier',
                'rejet_dossier',
                'upload_fichier',
                'remplacement_fichier',
                'suppression_fichier',
                'affectation_tache',
                'debut_tache',
                'finalisation_tache',
                'modification_tache',
                'commentaire',
                'changement_urgence',
                'changement_importance'
            ]);

            // Transitions
            $table->string('etape_precedente', 100)->nullable();
            $table->string('etape_nouvelle', 100)->nullable();
            $table->string('statut_precedent', 100)->nullable();
            $table->string('statut_nouveau', 100)->nullable();

            // Contenu
            $table->text('description');
            $table->text('commentaire')->nullable();
            $table->json('donnees_supplementaires')->nullable();

            // Métadonnées temporelles
            $table->timestamp('date_evenement')->useCurrent();
            $table->decimal('duree_execution', 8, 2)->nullable()
                  ->comment('Durée en heures');

            // Métadonnées utilisateur
            $table->string('role_utilisateur', 100)->nullable();
            $table->string('ip_address', 45)->nullable();

            $table->timestamps();

            // Index
            $table->index(['marche_id', 'date_evenement'], 'idx_marche_date');
            $table->index(['type_evenement', 'date_evenement'], 'idx_type_date');
            $table->index('user_id', 'idx_user');
            $table->index('dossier_id', 'idx_dossier');
            $table->index('tache_id', 'idx_tache');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historiques_marche');
    }
};