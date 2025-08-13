<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('innovations', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description');
            $table->enum('statut', ['brouillon', 'en_cours', 'en_attente', 'termine', 'annule'])
                  ->default('brouillon');
            $table->enum('priorite', ['basse', 'moyenne', 'haute', 'critique'])
                  ->default('moyenne');
            $table->date('date_debut')->nullable();
            $table->date('date_fin_prevue')->nullable();
            $table->date('date_fin_reelle')->nullable();
            $table->decimal('budget_alloue', 15, 2)->nullable();
            $table->decimal('budget_utilise', 15, 2)->nullable()->default(0);
            $table->foreignId('responsable_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('createur_id')->constrained('users')->onDelete('cascade');
            $table->json('tags')->nullable();
            $table->text('objectifs')->nullable();
            $table->text('risques')->nullable();
            $table->integer('progression')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('innovations');
    }
};
