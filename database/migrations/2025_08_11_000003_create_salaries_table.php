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
            $table->string('nom_profil')->nullable();
            $table->string('poste')->nullable();
            $table->boolean('is_accepted')->default(false); 
            $table->string('telephone');
            $table->decimal('salaire_mensuel', 10, 2);
            $table->date('date_embauche')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->json('projet_ids')->default('[]');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('salaries');
    }
};