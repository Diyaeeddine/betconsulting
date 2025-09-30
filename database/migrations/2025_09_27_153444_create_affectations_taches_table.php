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
        Schema::create('affectations_taches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tache_dossier_id')->constrained('taches_dossier')->onDelete('cascade');
            $table->foreignId('salarie_id')->constrained('salaries')->onDelete('cascade');
            $table->enum('role_affectation', ['responsable', 'collaborateur', 'support'])->default('collaborateur');
            $table->timestamp('date_affectation');
            $table->date('date_limite_assignee')->nullable();
            $table->enum('statut_affectation', ['active', 'suspendue', 'terminee'])->default('active');
            $table->text('notes_affectation')->nullable();
            $table->timestamps();
            
            $table->unique(['tache_dossier_id', 'salarie_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affectations_taches');
    }
};
