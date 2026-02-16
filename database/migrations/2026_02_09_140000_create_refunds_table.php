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
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->string('increment_id')->unique(); // REF-00001
            $table->enum('state', ['pending', 'approved', 'rejected', 'processed'])->default('pending');
            
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            
            // Refund details
            $table->enum('refund_type', ['full', 'partial'])->default('full');
            $table->text('reason')->nullable();
            $table->text('admin_notes')->nullable();
            
            // Amounts
            $table->decimal('sub_total', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('adjustment_refund', 12, 2)->default(0); // Extra refund amount
            $table->decimal('adjustment_fee', 12, 2)->default(0); // Deduction fee
            $table->decimal('grand_total', 12, 2)->default(0);
            
            // Processing info
            $table->string('refund_method')->nullable(); // bank_transfer, wallet, original_payment
            $table->string('transaction_id')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
        
        // Refund Items table
        Schema::create('refund_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('refund_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_item_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('service_id')->nullable()->constrained()->onDelete('set null');
            
            $table->string('name');
            $table->string('sku')->nullable();
            $table->text('description')->nullable();
            $table->integer('qty')->default(1);
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refund_items');
        Schema::dropIfExists('refunds');
    }
};
