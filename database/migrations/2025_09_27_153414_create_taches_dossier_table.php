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
        Schema::create('taches_dossier', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_marche_id')->constrained('dossiers_marche')->onDelete('cascade');
            $table->string('nom_tache');
            $table->text('description')->nullable();
            $table->enum('priorite', ['faible', 'moyenne', 'elevee'])->default('moyenne');
            $table->enum('statut', ['en_attente', 'en_cours', 'terminee', 'validee'])->default('en_attente');
            $table->integer('ordre')->default(0);
            $table->decimal('duree_estimee', 8, 2)->nullable(); // en heures
            $table->decimal('duree_reelle', 8, 2)->nullable(); // en heures
            $table->date('date_limite')->nullable();
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->text('instructions')->nullable();
            $table->json('fichiers_requis')->nullable();
            $table->json('fichiers_produits')->nullable();
            $table->text('commentaires')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taches_dossier');
    }
};