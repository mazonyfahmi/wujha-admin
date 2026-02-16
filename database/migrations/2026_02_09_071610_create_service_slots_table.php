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
        Schema::create('service_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            
            // Date and time
            $table->date('date')->nullable();
            $table->time('start_time');
            $table->time('end_time');
            
            // Capacity management
            $table->unsignedInteger('capacity')->default(1);
            $table->unsignedInteger('booked_count')->default(0);
            
            // Availability
            $table->boolean('is_available')->default(true);
            
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index(['service_id', 'date', 'is_available']);
            $table->index(['date', 'start_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_slots');
    }
};
