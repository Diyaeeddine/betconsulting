<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration 2 : participations_marche
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('participations_marche', function (Blueprint $table) {
            $table->id();

            $table->foreignId('marche_id')
                  ->constrained('marche_public')
                  ->cascadeOnDelete();

            $table->foreignId('salarie_id')
                  ->constrained('salaries')
                  ->cascadeOnDelete();

            $table->enum('role_global', [
                'chef_projet',
                'responsable_technique',
                'responsable_financier',
                'responsable_administratif',
                'contributeur',
                'validateur'
            ]);

            // Statistiques
            $table->integer('nb_taches_affectees')->default(0);
            $table->integer('nb_taches_terminees')->default(0);
            $table->decimal('temps_total_passe', 8, 2)->default(0.00)
                  ->comment('En heures');

            // Dates
            $table->timestamp('date_debut_participation');
            $table->timestamp('date_fin_participation')->nullable();
            $table->boolean('participation_active')->default(1);

            $table->timestamps();

            // Index + unique
            $table->unique(['marche_id', 'salarie_id', 'role_global'], 'uk_marche_salarie_role');
            $table->index('participation_active', 'idx_participation_active');
            $table->index('salarie_id', 'idx_salarie');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participations_marche');
    }
};