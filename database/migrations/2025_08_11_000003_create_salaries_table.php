<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->string('poste')->nullable();
            $table->string('nom_profil')->nullable();
            $table->boolean('is_accepted')->default(false);
            $table->string('telephone');
            $table->decimal('salaire_mensuel', 10, 2)->nullable();
            $table->date('date_embauche')->nullable();
            $table->enum('statut', ['actif', 'inactif', 'conge', 'demission'])->default('actif');
            $table->string('contrat_cdi_path')->nullable();
            $table->string('cv_path')->nullable();
            $table->string('diplome_path')->nullable();
            $table->string('certificat_travail_path')->nullable();
            $table->enum('emplacement', ['bureau','terrain'])->default('bureau');
            $table->json('terrain_ids')->default('[]');
            $table->json('projet_ids')->default('[]');
            $table->unsignedBigInteger('profil_id')->nullable(); // declare only
            $table->timestamps();
    });

    }

    public function down(): void {
        Schema::dropIfExists('salaries');
    }
};