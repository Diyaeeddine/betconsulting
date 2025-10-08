<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('code')->nullable(); // Code du document (ex: DOC-2025-001)
            $table->string('periodicite');
            $table->date('date_expiration')->nullable();
            $table->string('file_path');
            $table->boolean('is_complementary')->default(false);
               $table->boolean('archived')->default(false);
            $table->unsignedBigInteger('user_id');
            $table->text('notes')->nullable(); // Notes additionnelles
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            
            // Index for better performance
            $table->index(['archived', 'is_complementary']);
            $table->index('date_expiration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};