<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('marches_taches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marche_id')->constrained('marches')->onDelete('cascade');
            
            $table->string('nom_tache');
            $table->text('description')->nullable();
            $table->enum('priorite', ['basse', 'normale', 'haute', 'urgente'])->default('normale');
            $table->enum('statut', ['en_attente', 'en_cours', 'terminee', 'annulee'])->default('en_attente');
            
            $table->date('date_debut_prevue')->nullable();
            $table->date('date_fin_prevue')->nullable();
            $table->date('date_debut_reelle')->nullable();
            $table->date('date_fin_reelle')->nullable();
            
            $table->unsignedBigInteger('assigne_a')->nullable();
            $table->unsignedBigInteger('cree_par')->nullable();
            
            $table->integer('pourcentage_completion')->default(0);
            $table->text('commentaires')->nullable();
            
            $table->timestamps();
            
            $table->index(['marche_id', 'statut']);
            $table->index('assigne_a');
        });
    }

    public function down()
    {
        Schema::dropIfExists('marches_taches');
    }
};
