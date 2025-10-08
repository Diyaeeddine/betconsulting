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
        Schema::create('references', function (Blueprint $table) {
            $table->id();
            
            // Submitter information
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');
            
            // Project information
            $table->string('project_name');
            $table->string('client_name');
            $table->string('project_value');
            $table->date('start_date');
            $table->date('end_date');
            $table->text('description');
            
            // Document information
            $table->string('document_path');
            $table->string('document_name');
            
            // Status and validation
            $table->enum('status', ['pending', 'validated', 'rejected'])
                ->default('pending');
            $table->text('validation_comment')->nullable();
            
            // Timestamps
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('validated_at')->nullable();
            
            // Validator information
            $table->foreignId('validated_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index('status');
            $table->index('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('references');
    }
};
