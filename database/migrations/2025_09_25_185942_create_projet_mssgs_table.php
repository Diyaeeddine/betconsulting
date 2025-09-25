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
        Schema::create('projet_mssgs', function (Blueprint $table) {
            $table->id();
            $table->text('mssg'); // message content
            $table->unsignedBigInteger('sent_by'); // who sent it (can be user or salary id)
            $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
            $table->timestamps();

            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projet_mssgs');
    }
};
