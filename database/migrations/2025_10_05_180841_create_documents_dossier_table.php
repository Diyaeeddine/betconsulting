```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration 1 : documents_dossier
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('documents_dossier', function (Blueprint $table) {
            $table->id();

            // Relations
            $table->foreignId('dossier_marche_id')
                  ->constrained('dossiers_marche')
                  ->cascadeOnDelete();

            $table->foreignId('document_id')
                  ->nullable()
                  ->constrained('documents')
                  ->nullOnDelete();

            $table->foreignId('tache_dossier_id')
                  ->nullable()
                  ->constrained('taches_dossier')
                  ->nullOnDelete();

            // Type
            $table->enum('type_attachment', ['document_permanent', 'fichier_specifique']);

            // Informations fichier
            $table->string('nom_fichier', 255);
            $table->string('nom_original', 255);
            $table->string('chemin_fichier', 500);
            $table->string('type_mime', 100)->nullable();
            $table->bigInteger('taille_fichier')->nullable();

            // Métadonnées
            $table->foreignId('uploaded_by')
                  ->constrained('users');
            $table->timestamp('date_upload')->useCurrent();
            $table->text('description')->nullable();

            // Validation
            $table->boolean('est_valide_au_moment_usage')->default(1);
            $table->dateTime('date_expiration_au_moment_usage')->nullable();

            $table->timestamps();

            // Index
            $table->index(['dossier_marche_id', 'type_attachment'], 'idx_dossier_type');
            $table->index('document_id', 'idx_document');
            $table->index('tache_dossier_id', 'idx_tache');
            $table->index('uploaded_by', 'idx_uploader');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents_dossier');
    }
};