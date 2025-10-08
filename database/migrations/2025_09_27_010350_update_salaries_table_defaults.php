<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration 
{
    public function up(): void 
    {
        // Update existing NULL values to empty JSON arrays
        DB::table('plans')->whereNull('terrains_ids')->update(['terrains_ids' => '[]']);
        DB::table('plans')->whereNull('salarie_ids')->update(['salarie_ids' => '[]']);
        
        // Add plan_docs column if it doesn't exist and set defaults
        Schema::table('plans', function (Blueprint $table) {
            $table->json('terrains_ids')->default('[]')->change();
            $table->json('salarie_ids')->default('[]')->change();
            
            // Add plan_docs column if it doesn't exist
            if (!Schema::hasColumn('plans', 'plan_docs')) {
                $table->json('plan_docs')->default('[]')->after('salarie_ids');
            }
        });
    }

    public function down(): void 
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->json('terrains_ids')->nullable()->change();
            $table->json('salarie_ids')->nullable()->change();
        });
    }
};