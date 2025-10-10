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
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('type', ['en_ligne', 'presentiel']);
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->integer('duree'); // en heures
            $table->enum('statut', ['planifiée', 'en cours', 'terminée'])->default('planifiée');
            $table->foreignId('responsable_id')->constrained('users')->onDelete('cascade');
            $table->text('competences')->nullable();
            $table->string('lien_meet')->nullable(); // uniquement si en_ligne
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};