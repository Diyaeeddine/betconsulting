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
        Schema::create('projet_salarie', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
            $table->foreignId('salarie_id')->constrained('salaries')->onDelete('cascade');
            $table->timestamp('date_affectation')->useCurrent();
            $table->timestamps();
            
            // Ensure unique combination
            $table->unique(['projet_id', 'salarie_id']);
            
            // Add indexes for better performance
            $table->index(['projet_id']);
            $table->index(['salarie_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projet_salarie');
    }
};

// Run this migration with: php artisan make:migration create_projet_salarie_table