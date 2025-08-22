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
        Schema::create('formation_salarie', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->onDelete('cascade');
            $table->foreignId('salarie_id')->constrained('salaries')->onDelete('cascade');
            $table->enum('statut', ['inscrit', 'en cours', 'terminée'])->default('inscrit');
            $table->integer('progression')->default(0); // %
            $table->float('note')->nullable(); // note finale (sur 20 ou 100)
            $table->timestamps();

            $table->unique(['formation_id', 'salarie_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formation_salarie');
    }
};
