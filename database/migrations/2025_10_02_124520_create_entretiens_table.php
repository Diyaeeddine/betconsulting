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
        Schema::create('entretiens', function (Blueprint $table) {
            $table->id();
            
            // Relations
            $table->foreignId('salarie_id')->constrained('salaries')->onDelete('cascade');
            
            // Informations de base
            $table->string('poste_vise');
            $table->date('date_entretien');
            $table->enum('type_entretien', ['premier', 'technique', 'final']);
            
            // Évaluateurs
            $table->string('evaluateur_principal');
            $table->string('expert_technique')->nullable();
            $table->string('responsable_rh')->nullable();
            
            // Scores détaillés (JSON)
            $table->json('scores_techniques')->nullable();
            $table->json('scores_comportementaux')->nullable();
            $table->json('scores_adequation')->nullable();
            
            // Scores agrégés
            $table->decimal('score_technique', 5, 2)->default(0);
            $table->decimal('score_comportemental', 5, 2)->default(0);
            $table->decimal('score_adequation', 5, 2)->default(0);
            $table->decimal('score_total', 5, 2)->default(0);
            
            // Observations
            $table->text('points_forts')->nullable();
            $table->text('points_vigilance')->nullable();
            
            // Recommandation
            $table->enum('recommandation', [
                'fortement_recommande',
                'recommande',
                'reserve',
                'non_recommande'
            ])->nullable();
            
            // Statut de l'entretien
            $table->enum('statut', [
                'en_cours',
                'complete',
                'en_attente_validation',
                'validee',
                'rejete'
            ])->default('en_cours');
            
            // Validation par Direction Générale
            $table->text('commentaire_validation')->nullable();
            $table->string('valide_par')->nullable();
            $table->timestamp('valide_le')->nullable();
            
            // Rejet par Direction Générale
            $table->text('motif_rejet')->nullable();
            $table->string('rejete_par')->nullable();
            $table->timestamp('rejete_le')->nullable();
            
            $table->timestamps();
            
            // Index pour optimisation
            $table->index('salarie_id');
            $table->index('statut');
            $table->index('date_entretien');
            $table->index('type_entretien');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entretiens');
    }
};