<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add performance indexes to frequently queried columns.
     */
    public function up(): void
    {
        // Orders: created_at for date range filters (customer_id index already exists)
        Schema::table('orders', function (Blueprint $table) {
            $table->index('created_at');
        });

        // Invoices: state filter, customer FK, date range, order FK
        Schema::table('invoices', function (Blueprint $table) {
            $table->index('state');
            $table->index('customer_id');
            $table->index('created_at');
        });

        // Refunds: state filter, customer FK, date range
        Schema::table('refunds', function (Blueprint $table) {
            $table->index('state');
            $table->index('customer_id');
            $table->index('created_at');
        });

        // Messages: unread count queries (receiver_id + is_read)
        Schema::table('messages', function (Blueprint $table) {
            $table->index(['receiver_id', 'is_read']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['state']);
            $table->dropIndex(['customer_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('refunds', function (Blueprint $table) {
            $table->dropIndex(['state']);
            $table->dropIndex(['customer_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['receiver_id', 'is_read']);
        });
    }
};
