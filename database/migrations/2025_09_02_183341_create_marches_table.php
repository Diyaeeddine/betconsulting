<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('marches', function (Blueprint $table) {
            $table->id();
            
            // Informations de base
            $table->string('numero_marche')->unique();
            $table->string('nom_projet');
            $table->text('description')->nullable();
            $table->string('client');
            $table->string('lieu_execution');
            
            // Statut du processus
            $table->enum('statut', [
                'appel_offres',
                'filtrage_initial', 
                'estimation_budgetaire',
                'attente_acceptation_admin',
                'accepte_admin',
                'caution_provisoire',
                'fichier_projet',
                'check_liste',
                'diffusion_taches',
                'en_cours',
                'termine',
                'annule'
            ])->default('appel_offres');
            
            // Dates importantes
            $table->date('date_appel_offres');
            $table->date('date_limite_soumission')->nullable();
            $table->date('date_filtrage')->nullable();
            $table->date('date_estimation')->nullable();
            $table->date('date_acceptation_admin')->nullable();
            $table->date('date_caution')->nullable();
            $table->date('date_debut_prevue')->nullable();
            $table->date('date_fin_prevue')->nullable();
            $table->date('date_debut_reelle')->nullable();
            $table->date('date_fin_reelle')->nullable();
            
            // Informations financières
            $table->decimal('montant_estime', 15, 2)->nullable();
            $table->decimal('montant_caution', 15, 2)->nullable();
            $table->decimal('montant_final', 15, 2)->nullable();
            $table->string('devise', 3)->default('MAD');
            
            // Validation des étapes
            $table->boolean('filtrage_valide')->default(false);
            $table->boolean('estimation_validee')->default(false);
            $table->boolean('admin_accepte')->default(false);
            $table->boolean('caution_payee')->default(false);
            $table->boolean('fichier_projet_complete')->default(false);
            $table->boolean('check_liste_validee')->default(false);
            $table->boolean('taches_diffusees')->default(false);
            
            // Utilisateurs responsables
            $table->unsignedBigInteger('responsable_commercial_id')->nullable();
            $table->unsignedBigInteger('responsable_technique_id')->nullable();
            $table->unsignedBigInteger('admin_validateur_id')->nullable();
            
            // Commentaires et notes
            $table->text('commentaires_filtrage')->nullable();
            $table->text('commentaires_estimation')->nullable();
            $table->text('commentaires_admin')->nullable();
            $table->text('notes_generales')->nullable();
            
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index('statut');
            $table->index('date_appel_offres');
            $table->index('responsable_commercial_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('marches');
    }
};
