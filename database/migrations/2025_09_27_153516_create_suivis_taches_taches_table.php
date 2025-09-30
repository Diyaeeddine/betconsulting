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
        Schema::create('suivis_taches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tache_dossier_id')->constrained('taches_dossier')->onDelete('cascade');
            $table->foreignId('salarie_id')->constrained('salaries')->onDelete('cascade');
            $table->enum('type_action', ['debut', 'progression', 'pause', 'reprise', 'finalisation', 'validation']);
            $table->text('commentaire')->nullable();
            $table->timestamp('date_action');
            $table->decimal('temps_passe', 8, 2)->nullable(); // en heures
            $table->decimal('pourcentage_realise', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suivis_taches_taches');
    }
};
