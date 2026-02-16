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
        Schema::create('service_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            
            // Attribute definition
            $table->string('key', 100);
            $table->string('value_type', 20); // text, number, boolean, select
            $table->text('value')->nullable();
            
            // For select type - array of options
            $table->json('options')->nullable();
            
            // Settings
            $table->boolean('is_required')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            
            $table->timestamps();
            
            // Unique key per service
            $table->unique(['service_id', 'key']);
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_attributes');
    }
};
