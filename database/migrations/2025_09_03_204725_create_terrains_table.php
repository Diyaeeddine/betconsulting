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
        Schema::create('terrains', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();

            // Replacing lat/long with points (array of coordinates)
            $table->json('points'); // e.g. [{"lat":..., "lng":...}, {...}, ...]

            // Surface in square meters or your preferred unit
            $table->decimal('surface', 20, 2)->nullable();

            $table->decimal('radius', 8, 2)->nullable();

            $table->json('salarie_ids');

            $table->enum('statut_tech', ['validé','terminé','en_cours','en_revision'])
                ->default('en_revision');
            $table->enum('statut_final', ['validé','terminé','en_cours','en_revision'])
                ->default('en_revision');

            $table->foreignId('projet_id')
                ->constrained('projets')
                ->onDelete('cascade');

            $table->timestamps();
            $table->index(['projet_id']);
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('terrains');
    }
};
