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
        Schema::create('methodology_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', [
                'methodologie',
                'planning',
                'chronogram',
                'organigramme',
                'auto_control'
            ]);
            $table->string('file_name');
            $table->string('file_path');
            $table->bigInteger('file_size'); // File size in bytes
            $table->string('mime_type', 100);
            $table->enum('status', ['draft', 'submitted', 'validated', 'rejected'])
                  ->default('submitted');
            $table->foreignId('validator_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('validator_comment')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->timestamps();

            // Indexes for better query performance
            $table->index(['user_id', 'type']);
            $table->index(['status']);
            $table->index(['validator_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('methodology_documents');
    }
};