<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('marches_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marche_id')->constrained('marches')->onDelete('cascade');
            
            $table->string('nom_document');
            $table->enum('type_document', [
                'appel_offres',
                'estimation_budgetaire', 
                'validation_admin',
                'caution_bancaire',
                'fichier_projet',
                'check_liste',
                'contrat',
                'autre'
            ]);
            
            $table->string('chemin_fichier');
            $table->string('nom_fichier_original');
            $table->string('extension');
            $table->integer('taille_fichier'); // en bytes
            
            $table->unsignedBigInteger('uploade_par')->nullable();
            $table->timestamp('date_upload');
            $table->boolean('est_valide')->default(false);
            $table->text('commentaires')->nullable();
            
            $table->timestamps();
            
            $table->index(['marche_id', 'type_document']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('marches_documents');
    }
};
