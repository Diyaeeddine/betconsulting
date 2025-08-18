<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('projets', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->decimal('budget_total', 15, 2);
            $table->decimal('budget_utilise', 15, 2)->default(0);
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->enum('statut', ['en_cours', 'termine', 'en_attente'])->default('en_cours');
            $table->string('client')->nullable();
            $table->string('lieu_realisation')->nullable();
            $table->foreignId('responsable_id')->constrained('users')->onDelete('cascade');
            $table->enum('type_projet', ['suivi', 'etude', 'controle']);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('radius', 8, 2)->nullable();
            $table->json('salarie_ids')->default('[]'); // Stores related salaries
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('projets');
    }
};
