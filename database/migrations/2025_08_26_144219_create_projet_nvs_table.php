<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projet_nvs', function (Blueprint $table) {
            $table->id();
            $table->string('organisme')->nullable();
            $table->text('objet')->nullable();
            $table->string('ville_execution')->nullable();
            $table->string('allotissement')->nullable();
            $table->text('adresse_retrait')->nullable();
            $table->text('contact')->nullable();
            $table->string('montant_retrait')->nullable();
            $table->string('mode_paiement')->nullable();
            $table->string('mt_caution')->nullable();
            $table->string('budget')->nullable();
            $table->string('visite_lieux')->nullable();
            $table->string('type')->nullable();
            $table->text('observation')->nullable();
            $table->string('soumission_electronique')->nullable();
            $table->text('support')->nullable();
            $table->text('secteur')->nullable();
            $table->string('telechargement')->nullable(); // lien zip
            $table->json('chemin_fichiers')->nullable(); // chemins des fichiers extraits
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projet_nvs');
    }
};
