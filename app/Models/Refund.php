<?php

namespace App\Models;

use App\Enums\RefundState;
use App\Traits\Filterable;
use App\Traits\HasIncrementId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Refund extends Model
{
    use HasIncrementId, Filterable, SoftDeletes;

    protected array $searchable = ['increment_id', 'reason', 'customer.first_name', 'customer.last_name'];
    protected array $filterable = ['state', 'refund_type'];

    protected static string $incrementIdPrefix = 'REF';
    protected static int $incrementIdPadLength = 5;
    protected $fillable = [
        'increment_id',
        'state',
        'order_id',
        'invoice_id',
        'customer_id',
        'refund_type',
        'reason',
        'admin_notes',
        'sub_total',
        'tax_amount',
        'adjustment_refund',
        'adjustment_fee',
        'grand_total',
        'refund_method',
        'transaction_id',
        'processed_at',
        'processed_by',
    ];

    protected $casts = [
        'sub_total' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'adjustment_refund' => 'decimal:2',
        'adjustment_fee' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'processed_at' => 'datetime',
        'state' => RefundState::class,
    ];

    /**
     * Get the order that owns the refund.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the invoice associated with the refund.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the customer that owns the refund.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the user who processed the refund.
     */
    public function processedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get the items for the refund.
     */
    public function items(): HasMany
    {
        return $this->hasMany(RefundItem::class);
    }

    /**
     * Get available refund states.
     */
    public static function getStates(): array
    {
        return RefundState::toArray();
    }

    /**
     * Get refund types.
     */
    public static function getTypes(): array
    {
        return [
            'full' => 'Full Refund',
            'partial' => 'Partial Refund',
        ];
    }

    /**
     * Get refund methods.
     */
    public static function getMethods(): array
    {
        return [
            'original_payment' => 'Original Payment Method',
            'bank_transfer' => 'Bank Transfer',
            'wallet' => 'Customer Wallet',
        ];
    }
}
