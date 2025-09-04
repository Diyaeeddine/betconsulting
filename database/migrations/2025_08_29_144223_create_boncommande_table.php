<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('bons_commandes', function (Blueprint $table) {
            $table->id();
            $table->string('n_ordre')->nullable();                // N d'ordre
            $table->string('reference')->nullable();              // Référence
            $table->string('date_heure_limite')->nullable();     // Date/Heure limite
            $table->text('observation')->nullable();             // Obsérvation
            $table->string('objet')->nullable();                 // Objet
            $table->string('visite_lieux')->nullable();          // Visite des lieux
            $table->string('ville_execution')->nullable();       // Ville d'exécution
            $table->string('organisme')->nullable();             // Organisme
            $table->string('telechargement_dao')->nullable();    // Téléchargement_DAO
            $table->string('lien_cliquer_ici')->nullable();      // Lien_Cliquer_Ici
            $table->string('type')->nullable();                  // Type
            $table->string('soumission_electronique')->nullable(); // Soumission électronique
            $table->json('chemin_fichiers')->nullable();        // Nouvel attribut JSON
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('bons_commandes');
    }
};