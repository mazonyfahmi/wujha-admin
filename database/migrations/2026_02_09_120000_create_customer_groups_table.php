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
        Schema::create('customer_groups', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->boolean('is_user_defined')->default(true);
            $table->timestamps();
        });

        // Insert default groups
        DB::table('customer_groups')->insert([
            [
                'code' => 'guest',
                'name' => 'Guest',
                'is_user_defined' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'general',
                'name' => 'General',
                'is_user_defined' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'wholesale',
                'name' => 'Wholesale',
                'is_user_defined' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_groups');
    }
};
