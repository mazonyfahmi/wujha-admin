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
            // Service type (consultation, subscription, on_demand, package)
            $table->string('type')->default('on_demand')->after('is_popular');
            
            // Type-specific configuration (JSON)
            $table->json('type_config')->nullable()->after('type');
            
            // Duration limits (in minutes)
            $table->integer('min_duration')->nullable()->after('duration');
            $table->integer('max_duration')->nullable()->after('min_duration');
            
            // Deposit/advance payment
            $table->decimal('deposit_amount', 10, 2)->nullable()->after('price');
            
            // Approval workflow
            $table->boolean('requires_approval')->default(false)->after('is_active');
            
            // Add index for type filtering
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropColumn([
                'type',
                'type_config',
                'min_duration',
                'max_duration',
                'deposit_amount',
                'requires_approval',
            ]);
        });
    }
};
