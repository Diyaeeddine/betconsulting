<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificats_medicaux', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salarie_id')->constrained('salaries')->onDelete('cascade');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->string('fichier_path');
            $table->string('fichier_original');
            $table->text('description')->nullable();
            $table->enum('statut', ['en_attente', 'valide', 'refuse'])->default('en_attente');
            $table->foreignId('valide_par')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('date_validation')->nullable();
            $table->text('commentaire_validation')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificats_medicaux');
    }
};