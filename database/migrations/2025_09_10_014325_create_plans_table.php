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
        Schema::create('plans', function (Blueprint $table) {
            $table->id(); 
            $table->date('date_debut');
            $table->date('date_fin');   
            $table->string('mssg')->nullable(); 
            $table->text('description')->nullable(); // description (nullable text)
            $table->json('terrains_ids')->nullable(); // terrains_ids (json)
            $table->json('salarie_ids')->nullable(); // salarie_ids (json)
            $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
            $table->string('statut');
            $table->json('plan_docs')->nullable();
            $table->timestamps(); // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
