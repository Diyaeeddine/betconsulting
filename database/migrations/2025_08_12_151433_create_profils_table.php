<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProfilsTable extends Migration
{
    public function up()
    {
        Schema::create('profils', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('salaries')->onDelete('cascade');
            $table->string('nom_profil');
            $table->enum('type_profil', [
            'ingenieur_structure',
            'ingenieur_genie_civil',
            'ingenieur_electricite_fluides',
            'dessinateur_projeteur',
            'ingenieur_bim',
            'chef_de_chantier',
            'conducteur_de_travaux',
            'techniciens_ouvriers_specialises',
            'technicien_specialise',
            'responsable_hse',
            'controleur_technique',
            'metreur_economiste',
            'geometre_topographe',
            'responsable_achats',
            'gestionnaire_contrats',
            ])->nullable();
            $table->timestamps();
        });
            }

    public function down()
    {
        Schema::dropIfExists('profils');
    }
}
