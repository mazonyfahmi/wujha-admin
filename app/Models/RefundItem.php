<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefundItem extends Model
{
    protected $fillable = [
        'refund_id',
        'invoice_item_id',
        'service_id',
        'name',
        'sku',
        'description',
        'qty',
        'price',
        'tax_amount',
        'total',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Get the refund that owns the item.
     */
    public function refund(): BelongsTo
    {
        return $this->belongsTo(Refund::class);
    }

    /**
     * Get the invoice item this refund item refers to.
     */
    public function invoiceItem(): BelongsTo
    {
        return $this->belongsTo(InvoiceItem::class);
    }

    /**
     * Get the service for this item.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
