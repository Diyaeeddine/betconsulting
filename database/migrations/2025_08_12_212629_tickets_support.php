<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_supports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('innovation_id')->nullable()->constrained('innovations')->onDelete('cascade');
            $table->string('titre');
            $table->text('description');
            $table->enum('type', ['bug', 'amelioration', 'question', 'incident', 'demande'])
                  ->default('question');
            $table->enum('statut', ['ouvert', 'en_cours', 'en_attente', 'resolu', 'ferme'])
                  ->default('ouvert');
            $table->enum('priorite', ['basse', 'moyenne', 'haute', 'critique'])
                  ->default('moyenne');
            $table->enum('severite', ['mineure', 'majeure', 'critique', 'bloquante'])
                  ->default('mineure');
            $table->foreignId('demandeur_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assignee_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('solution')->nullable();
            $table->json('etapes_reproduction')->nullable();
            $table->enum('environnement', ['dev', 'test', 'prod'])->nullable();
            $table->timestamp('date_resolution')->nullable();
            $table->integer('temps_resolution_heures')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_supports');
    }
};
