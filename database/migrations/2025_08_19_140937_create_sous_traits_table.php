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
       Schema::create('sous_traits', function (Blueprint $table) {
            $table->id();
            $table->string('nom'); // required
            $table->string('poste'); // required
            $table->text('description')->nullable();
            $table->json('formation')->nullable();
            $table->json('experience')->nullable();
            $table->json('competences')->nullable(); // stored as array/json
            $table->string('autre')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sous_traits');
    }
};