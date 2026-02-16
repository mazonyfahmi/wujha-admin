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
        Schema::table('services', function (Blueprint $table) {
            $table->string('short_description')->nullable()->after('description');
            $table->text('requirements')->nullable()->after('short_description');
            $table->text('terms')->nullable()->after('requirements');
            $table->json('steps')->nullable()->after('terms');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['short_description', 'requirements', 'terms', 'steps']);
        });
    }
};
