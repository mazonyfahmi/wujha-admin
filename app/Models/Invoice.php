<?php

namespace App\Models;

use App\Enums\InvoiceState;
use App\Traits\Filterable;
use App\Traits\HasIncrementId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasIncrementId, Filterable, SoftDeletes;

    protected array $searchable = ['increment_id', 'billing_address_name', 'billing_address_email'];
    protected array $filterable = ['state'];

    protected static string $incrementIdPrefix = 'INV';
    protected static int $incrementIdPadLength = 5;
    protected $fillable = [
        'increment_id',
        'state',
        'order_id',
        'customer_id',
        'billing_address_name',
        'billing_address_email',
        'billing_address_phone',
        'billing_address',
        'sub_total',
        'tax_amount',
        'discount_amount',
        'grand_total',
        'transaction_id',
        'payment_method',
    ];

    protected $casts = [
        'sub_total' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'state' => InvoiceState::class,
    ];

    /**
     * Get the order that owns the invoice.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the customer that owns the invoice.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the items for the invoice.
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Get available invoice states.
     */
    public static function getStates(): array
    {
        return InvoiceState::toArray();
    }
}
