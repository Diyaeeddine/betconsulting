<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projet_mps', function (Blueprint $table) {
            $table->id();
            $table->string('type_procedure')->nullable();
            $table->text('detail_procedure')->nullable();
            $table->string('categorie')->nullable();
            $table->date('date_publication')->nullable();
            $table->string('reference')->nullable();
            $table->text('objet')->nullable();
            $table->text('objet_complet')->nullable();
            $table->text('acheteur_public')->nullable();
            $table->string('lieu_execution')->nullable();
            $table->text('lieu_execution_complet')->nullable();
            $table->text('lien_detail_lots')->nullable();
            $table->dateTime('date_limite')->nullable();
            $table->text('type_reponse_electronique')->nullable();
            $table->text('lien_consultation')->nullable();
            $table->string('ref_consultation_id')->nullable();
            $table->dateTime('extracted_at')->nullable();
            $table->integer('row_index')->nullable();
            $table->string('storage_link_csv')->nullable();
            $table->string('storage_link_json')->nullable();
            $table->json('EXTRACTED_FILES')->nullable(); // fichiers extraits du zip
            $table->string('chemin_zip')->nullable();    // chemin vers le zip original
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projet_mps');
    }
};