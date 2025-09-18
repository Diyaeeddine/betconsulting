<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('vehicules', function (Blueprint $table) {
            $table->id();
            $table->string('modele');
            $table->string('matricule')->unique();
            $table->string('marque');
            $table->enum('type', ['camion', 'voiture', 'engine', 'autre']);
            $table->enum('etat', ['disponible', 'en_panne', 'en_mission'])->default('disponible');
            $table->decimal('carburant', 5, 2)->nullable();
            // Location
            $table->decimal('cout_location_jour', 10, 2)->nullable();
            $table->date('date_debut_location')->nullable();
            $table->date('date_fin_location')->nullable();
            $table->decimal('cout_location', 10, 2)->nullable();
            $table->integer('duree_location')->nullable();

            // Affectation salarié
            $table->date('date_affectation')->nullable();
            $table->date('date_disponibilite')->nullable();
            $table->integer('duree_affectation')->nullable();
            $table->foreignId('salarie_id')->nullable()->constrained('salaries')->onDelete('set null');

            // Statut achat / location
            $table->enum('statut', ['achete', 'loue'])->nullable();

            // Achat
            $table->date('date_achat')->nullable();
            $table->enum('type_paiement', ['espece', 'credit'])->nullable();
            $table->decimal('montant_achat', 15, 2)->nullable();

            // Crédit (si achat à crédit)
            $table->decimal('montant_credit_total', 15, 2)->nullable();
            $table->decimal('montant_credit_mensuel', 15, 2)->nullable();
            $table->integer('duree_credit_mois')->nullable();
            $table->date('date_debut_credit')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('vehicules');
    }
};
