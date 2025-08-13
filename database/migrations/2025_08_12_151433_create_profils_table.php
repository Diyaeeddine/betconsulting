<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProfilsTable extends Migration
{
    public function up()
    {
        Schema::create('profils', function (Blueprint $table) {
            $table->id();

            // Points to salaries table
            $table->foreignId('user_id')->constrained('salaries')->onDelete('cascade');

            // Machine-friendly values (no apostrophes / special punctuation)
            $table->enum('nom_profil', [
                'bureau_etudes',
                'construction',
                'suivi_controle',
                'support_gestion',
            ]);

            $table->string('poste_profil')->nullable();
            $table->timestamps();
        });

            }

    public function down()
    {
        Schema::dropIfExists('profils');
    }
}
