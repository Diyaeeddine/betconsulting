<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Make sure the salaries table exists first
        if (!Schema::hasTable('salaries')) {
            throw new Exception('Table salaries must be created before profils.');
        }

        Schema::create('profils', function (Blueprint $table) {
            $table->id();

            // Linked salarie
            $table->foreignId('salarie_id')
                  ->nullable()
                  ->unique()
                  ->constrained('salaries')
                  ->onDelete('cascade')
                  ->after('id');

            // Catégorie principale du profil
            $table->string('categorie_profil');

            // Poste spécifique du profil
            $table->string('poste_profil');

            // Niveau d'expérience
            $table->string('niveau_experience')->default('junior');

            // Compétences techniques (JSON pour flexibilité)
            $table->json('competences_techniques')->nullable();

            // Certifications
            $table->json('certifications')->nullable();

            // Missions principales (optionnel)
            $table->text('missions')->nullable();

            // Statut du profil
            $table->boolean('actif')->default(true);

            $table->timestamps();

            // Index pour améliorer les performances
            $table->index('salarie_id');
            $table->index('categorie_profil');
            $table->index('poste_profil');
            $table->index('niveau_experience');
            $table->index('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profils');
    }
};
