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
            $table->decimal('cout_location_jour', 10, 2)->nullable();
            $table->date('date_affectation')->nullable();
            $table->date('date_disponibilite')->nullable();
            $table->integer('duree_affectation')->nullable(); 
            $table->foreignId('salarie_id')->nullable()->constrained('salaries')->onDelete('set null');
            $table->integer('duree_location')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('vehicules');
    }
};
