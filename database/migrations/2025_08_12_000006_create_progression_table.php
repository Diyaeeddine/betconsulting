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
        Schema::create('progressions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')
                  ->constrained('projets')
                  ->onDelete('cascade'); 
            $table->text('description_progress'); 
            $table->string('progress')->nullable(); 
            $table->enum('statut', ['valide', 'en_attente', 'rejete'])->default('en_attente'); 
            $table->date('date_validation')->nullable(); 
            $table->unsignedInteger('pourcentage')->default(0); 
            $table->text('commentaire')->nullable(); 
            $table->foreignId('valide_par')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progressions');
    }
};
