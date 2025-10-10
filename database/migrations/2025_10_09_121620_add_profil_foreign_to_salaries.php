<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('salaries', function (Blueprint $table) {
            if (!Schema::hasColumn('salaries', 'profil_id')) {
                $table->unsignedBigInteger('profil_id')->nullable();
            }

            $table->foreign('profil_id')
                  ->references('id')
                  ->on('profils')
                  ->onDelete('set null');
        });
    }

    public function down(): void {
        Schema::table('salaries', function (Blueprint $table) {
            $table->dropForeign(['profil_id']);
        });
    }
};
