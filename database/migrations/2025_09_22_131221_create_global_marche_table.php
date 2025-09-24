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
        Schema::create('global_marche', function (Blueprint $table) {
            $table->id();
            $table->string('type_ao')->nullable();
            $table->string('n_reference')->nullable();
            $table->string('etat')->nullable();
            $table->boolean('is_accepted')->default(false);
            $table->string('etape')->nullable();
            $table->date('date_limite')->nullable();
            $table->time('heure')->nullable();
            $table->string('mo')->nullable(); // M.O
            $table->string('objet')->nullable();
            $table->decimal('estimation', 15, 2)->nullable();
            $table->decimal('caution', 15, 2)->nullable();
            $table->string('attestation_reference')->nullable();
            $table->string('cnss')->nullable();
            $table->string('agrement')->nullable();
            $table->string('equipe_demandee')->nullable();
            $table->text('contrainte')->nullable();
            $table->text('autres')->nullable();
            $table->string('mode_attribution')->nullable();
            $table->string('lieu_ao')->nullable();
            $table->string('ville')->nullable();
            $table->string('lots')->nullable();
            $table->string('decision')->nullable();
            $table->date('date_decision')->nullable();
            $table->string('ordre_preparation')->nullable();
            $table->enum('importance', [
                'ao_ouvert',
                'ao_important',
                'ao_simplifie', 
                'ao_restreint',
                'ao_preselection',
                'ao_bon_commande',
            ])->nullable();
            $table->text('motif_refus')->nullable();     
            $table->text('motif_annulation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('global_marche');
    }
};
