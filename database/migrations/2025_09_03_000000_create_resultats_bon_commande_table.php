<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resultats_bon_commande', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->nullable();
            $table->string('maitre_ouvrage')->nullable();
            $table->text('objet')->nullable();
            $table->string('adjudicataire')->nullable();
            $table->string('ville')->nullable();
            $table->string('budget')->nullable();
            $table->string('montant')->nullable();
            $table->date('date_adjudications')->nullable();
            $table->date('date_ouverture')->nullable();
            $table->date('date_affichage')->nullable();
            $table->string('dao')->nullable();
            $table->string('lien_dao')->nullable();
            $table->json('chemin_fichiers')->nullable(); 

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resultats_bon_commande');
    }
};