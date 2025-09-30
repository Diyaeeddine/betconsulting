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
        Schema::create('dossiers_marche', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marche_id')->constrained('marche_public')->onDelete('cascade');
            $table->enum('type_dossier', ['administratif', 'technique', 'financier', 'offre_technique']);
            $table->string('nom_dossier');
            $table->text('description')->nullable();
            $table->enum('statut', ['en_attente', 'en_cours', 'termine', 'valide'])->default('en_attente');
            $table->decimal('pourcentage_avancement', 5, 2)->default(0);
            $table->date('date_limite')->nullable();
            $table->date('date_creation');
            $table->date('date_finalisation')->nullable();
            $table->json('fichiers_joints')->nullable();
            $table->text('commentaires')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dossiers_marche');
    }
};
