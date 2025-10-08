<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bons_commandes', function (Blueprint $table) {
            $table->id();
            
            // Core identification fields
            $table->string('n_ordre')->nullable()->index();
            $table->string('reference')->nullable()->index();
            
            // Date and deadline
            $table->dateTime('date_heure_limite')->nullable()->index();
            
            // Main content fields
            $table->text('objet')->nullable();
            $table->string('organisme', 500)->nullable()->index();
            $table->string('ville_execution')->nullable()->index();
            $table->string('type')->nullable()->index();
            $table->text('observation')->nullable();
            
            // Process fields
            $table->string('visite_lieux', 500)->nullable();
            $table->string('soumission_electronique', 500)->nullable();
            
            // Links and files
            $table->text('telechargement_dao')->nullable(); // Can be long URLs
            $table->text('lien_cliquer_ici')->nullable(); // Can be long URLs
            $table->json('chemin_fichiers')->nullable(); // Store extracted file paths
            
            // Metadata
            $table->timestamps();
            
            // Composite index for duplicate checking
            $table->index(['n_ordre', 'reference'], 'idx_n_ordre_reference');
            
            // Index for filtering and searching
            $table->index(['organisme', 'ville_execution'], 'idx_organisme_ville');
            $table->index(['date_heure_limite', 'type'], 'idx_date_type');
            
            // Full text search index (if using MySQL 5.7+)
            if (config('database.default') === 'mysql') {
                $table->fullText(['objet', 'organisme', 'ville_execution', 'observation'], 'idx_fulltext_search');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bons_commandes');
    }
};