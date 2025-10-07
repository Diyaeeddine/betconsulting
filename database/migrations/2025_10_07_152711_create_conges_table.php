// database/migrations/xxxx_create_conges_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salarie_id')->constrained('salaries')->onDelete('cascade');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->enum('type', ['conge_annuel', 'conge_maladie', 'conge_sans_solde']);
            $table->text('motif')->nullable();
            $table->enum('statut', ['en_attente', 'approuve', 'refuse'])->default('en_attente');
            $table->integer('nombre_jours')->nullable();
            $table->foreignId('approuve_par')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('date_approbation')->nullable();
            $table->text('commentaire_approbation')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conges');
    }
};