<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('global_marche', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->nullable();
            $table->enum('importance', [
                'ao_ouvert',
                'ao_important',
                'ao_simplifie', 
                'ao_restreint',
                'ao_preselection',
                'ao_bon_commande',
            ])->nullable();
                        $table->string('etat')->nullable();
            $table->boolean('is_accepted')->default(false);
            $table->string('etape')->nullable();
            $table->string('maitre_ouvrage')->nullable();
            $table->string('pv')->nullable();
            $table->decimal('caution_provisoire', 15, 2)->nullable();
            $table->date('date_ouverture')->nullable();
            $table->dateTime('date_limite_soumission')->nullable();
            $table->dateTime('date_publication')->nullable();
            $table->enum('statut', [
                'detecte',
                'evalue',
                'en_preparation',
                'soumis',
                'gagne',
                'perdu',
                'annule'
            ])->default('detecte');
            $table->enum('type_marche', [
                'etudes',
                'assistance_technique',
                'batiment',
                'voirie',
                'hydraulique'
            ])->nullable();
            $table->string('budget')->nullable();
            $table->enum('urgence', ['faible', 'moyenne', 'elevee'])->default('moyenne');
            $table->string('zone_geographique', 100)->nullable();

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
        Schema::dropIfExists('global_marche');
    }
};
