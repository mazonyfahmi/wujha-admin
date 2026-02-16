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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable()->unique();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('date_of_birth')->nullable();
            
            // Authentication
            $table->string('password')->nullable(); // Nullable for initial creation if auto-generated
            $table->string('api_token')->nullable()->unique(); // For API access
            $table->rememberToken();
            
            // Status & Flags
            $table->boolean('status')->default(true);
            $table->boolean('is_suspended')->default(false);
            $table->boolean('is_verified')->default(false); // Email verification
            $table->boolean('subscribed_to_news_letter')->default(false);
            $table->string('token')->nullable(); // For verification/reset
            
            // Relations (Nullable as referencing tables might not exist yet)
            $table->unsignedBigInteger('customer_group_id')->nullable();
            $table->unsignedBigInteger('channel_id')->nullable();
            
            $table->text('notes')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('email');
            $table->index('phone');
            $table->index('status');
            $table->index('api_token');
            $table->index('customer_group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
