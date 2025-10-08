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
            $table->string('password')->nullable();
            $table->rememberToken();

            $table->string('poste')->nullable();
            $table->boolean('is_accepted')->default(false);

            $table->string('telephone');
            $table->decimal('salaire_mensuel', 10, 2);
            $table->date('date_embauche')->nullable();

            // merged statut enums
            $table->enum('statut', ['actif', 'inactif', 'conge', 'demission'])
                  ->default('actif');

            // Documents paths
            $table->string('contrat_cdi_path')->nullable();
            $table->string('cv_path')->nullable();
            $table->string('diplome_path')->nullable();
            $table->string('certificat_travail_path')->nullable();

            // emplacement
            $table->enum('emplacement', ['bureau','terrain'])->default('bureau');

            // JSON fields
            $table->json('terrain_ids')->default('[]');
            $table->json('projet_ids')->default('[]');

            // user foreign key
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('salaries');
    }
};
    