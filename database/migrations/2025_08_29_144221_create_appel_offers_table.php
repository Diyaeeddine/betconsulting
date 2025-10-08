<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('global_marches', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->nullable();
            $table->string('maitre_ouvrage')->nullable();
            $table->string('pv')->nullable();
            $table->date('date_ouverture')->nullable();
            $table->string('budget')->nullable();
            $table->string('lien_dao')->nullable();
            $table->string('lien_pv')->nullable();
            $table->string('dao')->nullable();
            $table->date('date_adjudications')->nullable();
            $table->string('ville')->nullable();
            $table->string('montant')->nullable();
            $table->text('objet')->nullable();
            $table->string('adjudicataire')->nullable();
            $table->date('date_affichage')->nullable();
            $table->json('chemin_fichiers')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('global_marches');
    }
};