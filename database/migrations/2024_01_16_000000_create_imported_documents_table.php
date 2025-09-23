<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('imported_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_mp_id')
                ->constrained('projet_mps')
                ->onDelete('cascade');  // si un projet est supprimé, on supprime ses documents

            $table->string('label');  // le nom du label (ex: Pièces techniques)
            $table->json('files');    // les fichiers (stockés en tableau JSON)
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('imported_documents');
    }
};
