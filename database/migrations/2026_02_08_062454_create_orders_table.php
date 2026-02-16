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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->enum('status', ['pending', 'payment_confirmation', 'review', 'sent_to_agent', 'in_progress', 'issued', 'rejected'])->default('pending');
            $table->string('payment_method');
            $table->string('payment_proof_url')->nullable();
            $table->decimal('price', 10, 2);
            $table->timestamps();
            
            $table->index(['user_id']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
