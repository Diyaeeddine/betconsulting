<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('depenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
            $table->enum('type', ['technique', 'vehicule', 'materiel', 'autre']);
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->json('item'); // contient note, image, price
            $table->enum('statut', ['valide', 'non_valide'])->default('non_valide');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('depenses');
    }
};
