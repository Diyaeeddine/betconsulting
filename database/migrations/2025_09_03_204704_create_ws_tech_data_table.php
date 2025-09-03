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
        Schema::create('ws_tech_data', function (Blueprint $table) {
            $table->id();

            $table->foreignId('salarie_id')
                  ->constrained('salaries')
                  ->onDelete('cascade');

            $table->decimal('lat', 10, 7);
            $table->decimal('long', 10, 7);
            $table->decimal('alt', 8, 2)->nullable();

            // timezone-aware (e.g., "2025-09-03T21:18:00Z")
            $table->timestampTz('recorded_at');

            $table->timestamps();

            $table->index(['salarie_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ws_tech_data');
    }
};
