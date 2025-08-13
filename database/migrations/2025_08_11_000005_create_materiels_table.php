<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('materiels', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('type');
            $table->enum('etat', ['disponible', 'utilise', 'en_panne'])->default('disponible');
            $table->decimal('cout_location_jour', 10, 2)->nullable();
            $table->date('date_acquisition')->nullable();
            $table->integer('duree_location')->nullable();
            $table->foreignId('salarie_id')->nullable()->constrained('salaries')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('materiels');
    }
};
