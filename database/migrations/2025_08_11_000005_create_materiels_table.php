<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('materiels', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('marque')->nullable(); 
            $table->string('type');
            $table->enum('etat', ['disponible', 'en_panne', 'en_mission'])->default('disponible');
            $table->decimal('cout_location_jour', 10, 2)->nullable();
            $table->date('date_acquisition')->nullable();
            $table->integer('duree_location')->nullable();
            $table->enum('statut', ['achete', 'loue'])->nullable(); 
            $table->enum('type_paiement', ['espece', 'credit'])->nullable(); 
            $table->decimal('montant_achat', 12, 2)->nullable();
            $table->decimal('montant_credit_total', 12, 2)->nullable();
            $table->decimal('montant_credit_mensuel', 12, 2)->nullable();
            $table->integer('duree_credit_mois')->nullable();
            $table->date('date_debut_credit')->nullable();
            $table->date('date_debut_location')->nullable();
            $table->date('date_fin_location')->nullable();
            $table->decimal('cout_location', 12, 2)->nullable(); 
            $table->foreignId('salarie_id')->nullable()->constrained('salaries')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('materiels');
    }
};
