<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // ex: RC Mod.09
            $table->string('periodicite'); // ex: annuel, mensuel, chaque 3 mois
            $table->date('date_expiration')->nullable(); // pour gérer les délais
            $table->string('file_path'); // chemin du fichier stocké
            $table->boolean('is_complementary')->default(false);
            $table->boolean('archived')->default(false); // archive ou actif
            $table->unsignedBigInteger('user_id'); // qui a uploadé
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void {
        Schema::dropIfExists('documents');
    }
};
