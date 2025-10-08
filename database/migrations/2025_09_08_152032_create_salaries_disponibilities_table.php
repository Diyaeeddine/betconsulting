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
        Schema::create('salaries_disponibilities', function (Blueprint $table) {
            $table->id();
            $table->json('salaries_ids'); // JSON column
            $table->string('statut');     // status as string
            $table->string('message');
            $table->timestamp('recorded_at');
            $table->timestamps();         // created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salaries_disponibilities');
    }
};