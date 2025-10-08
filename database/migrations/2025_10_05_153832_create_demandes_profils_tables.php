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
        // Table principale des demandes de profils
        Schema::create('demandes_profils', function (Blueprint $table) {
            $table->id();
            
            // Qui a fait la demande
            $table->foreignId('demandeur_id')->constrained('users')->onDelete('cascade');
            
            // Informations de la demande
            $table->string('titre_demande');
            $table->text('description')->nullable();
            
            // Niveau d'urgence
            $table->enum('urgence', ['normale', 'urgent', 'critique'])->default('normale');
            
            // Date souhaitée pour avoir les profils
            $table->date('date_souhaitee')->nullable();
            
            // Statut de la demande
            $table->enum('statut', [
                'en_attente',
                'en_cours',
                'validee',
                'refusee',
                'completee'
            ])->default('en_attente');
            
            // Traitement par RH
            $table->foreignId('traite_par')->nullable()->constrained('users')->onDelete('set null');
            $table->text('commentaire_rh')->nullable();
            $table->timestamp('traite_le')->nullable();
            
            $table->timestamps();
            
            // Index pour améliorer les performances
            $table->index('demandeur_id');
            $table->index('statut');
            $table->index('urgence');
            $table->index('created_at');
        });

        // Table des détails de chaque profil demandé
        Schema::create('demandes_profils_details', function (Blueprint $table) {
            $table->id();
            
            // Lien avec la demande principale
            $table->foreignId('demande_id')->constrained('demandes_profils')->onDelete('cascade');
            
            // Type de profil demandé (doit correspondre avec la table profils)
            $table->enum('categorie_profil', [
                'profils_techniques_fondamentaux',
                'profils_specialises_techniques',
                'profils_conception_avancee',
                'profils_management_encadrement',
                'profils_controle_qualite',
                'profils_expertise_specialisee',
                'profils_digital_innovation',
                'profils_support_administratifs',
                'profils_commerciaux_techniques',
                'profils_rd_innovation',
            ]);
            
            // Poste spécifique demandé
            $table->enum('poste_profil', [
                // 1. Profils Techniques Fondamentaux
                'ingenieur_structure_beton_arme',
                'ingenieur_structures_metalliques',
                'technicien_bureau_etudes',
                'dessinateur_projeteur',
                
                // 2. Profils Spécialisés Techniques
                'ingenieur_geotechnicien',
                'ingenieur_vrd',
                'technicien_geotechnique',
                
                // 3. Profils Conception Avancée
                'coordinateur_bim',
                'modeleur_bim',
                'bim_manager',
                
                // 4. Profils Management et Encadrement
                'chef_projet_etudes',
                'responsable_bureau_etudes',
                'ingenieur_methodes',
                
                // 5. Profils Contrôle et Qualité
                'controleur_technique',
                'coordinateur_sps',
                
                // 6. Profils Expertise Spécialisée
                'expert_rehabilitation',
                'specialiste_hqe',
                'ingenieur_facades',
                
                // 7. Profils Digital et Innovation
                'ingenieur_computational_design',
                'specialiste_digital_twin',
                
                // 8. Profils Support et Administratifs
                'assistant_technique',
                'gestionnaire_projets',
                
                // 9. Profils Commerciaux Techniques
                'ingenieur_affaires',
                'responsable_marches_publics',
                
                // 10. Profils R&D et Innovation
                'ingenieur_recherche_developpement',
                'responsable_innovation',
            ]);
            
            // Quantité demandée
            $table->integer('quantite')->default(1);
            
            // Niveau d'expérience requis
            $table->enum('niveau_experience', [
                'junior',
                'intermediaire',
                'senior',
                'expert'
            ]);
            
            // Compétences spécifiques requises (stockées en JSON)
            $table->json('competences_requises')->nullable();
            
            // Disponibilité (calculée automatiquement)
            $table->boolean('disponible')->default(false);
            $table->integer('profils_disponibles')->default(0);
            
            $table->timestamps();
            
            // Index pour améliorer les performances
            $table->index('demande_id');
            $table->index(['categorie_profil', 'poste_profil']);
            $table->index('niveau_experience');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes_profils_details');
        Schema::dropIfExists('demandes_profils');
    }
};