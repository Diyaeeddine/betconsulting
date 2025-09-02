<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('marches_historique', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marche_id')->constrained('marches')->onDelete('cascade');
            
            $table->string('action'); // 'changement_statut', 'modification', 'ajout_document', etc.
            $table->string('ancien_statut')->nullable();
            $table->string('nouveau_statut')->nullable();
            $table->text('description');
            
            $table->unsignedBigInteger('effectue_par')->nullable();
            $table->json('donnees_supplementaires')->nullable(); // Pour stocker des infos additionnelles
            
            $table->timestamps();
            
            $table->index(['marche_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('marches_historique');
    }
};
